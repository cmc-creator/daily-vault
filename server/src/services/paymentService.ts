import Stripe from 'stripe'

import { PurchaseModel } from '../models/Purchase'
import { PlayerModel } from '../models/Player'
import { SHOP_ITEMS } from './gameService'

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return null
  }

  return new Stripe(secretKey)
}

function getItem(itemId: string) {
  return SHOP_ITEMS.find((item) => item.id === itemId)
}

export async function createCheckoutSession(playerId: string, itemId: string) {
  const item = getItem(itemId)
  if (!item) {
    throw new Error('Item not found.')
  }

  const stripe = getStripeClient()
  if (!stripe) {
    if (process.env.ALLOW_DEMO_CHECKOUT !== 'true') {
      throw new Error('Stripe checkout is not configured for this environment.')
    }
    await grantShopReward(playerId, itemId)
    return { mode: 'demo' as const, message: `${item.name} granted in local demo mode.` }
  }

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${frontendUrl}?checkout=success`,
    cancel_url: `${frontendUrl}?checkout=cancelled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            description: item.description,
          },
        },
      },
    ],
    metadata: {
      playerId,
      itemId,
    },
  })

  return {
    mode: 'stripe' as const,
    checkoutUrl: session.url ?? undefined,
    message: `Stripe checkout created for ${item.name}.`,
  }
}

export async function handleCheckoutCompleted(playerId: string, itemId: string, checkoutSessionId: string) {
  const existingPurchase = await PurchaseModel.findOne({ checkoutSessionId }).lean()
  if (existingPurchase) {
    if (String(existingPurchase.player) !== playerId || existingPurchase.itemId !== itemId) {
      throw new Error('Checkout session metadata mismatch.')
    }
    return
  }

  try {
    await PurchaseModel.create({
      player: playerId,
      itemId,
      checkoutSessionId,
    })
  } catch (error) {
    const existing = await PurchaseModel.findOne({ checkoutSessionId }).lean()
    if (existing) {
      if (String(existing.player) !== playerId || existing.itemId !== itemId) {
        throw new Error('Checkout session metadata mismatch.')
      }
      return
    }
    throw error
  }

  await grantShopReward(playerId, itemId)
}

export async function verifyAndHandleWebhook(signature: string | undefined, body: Buffer) {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret || !signature) {
    throw new Error('Stripe webhook is not configured.')
  }

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const playerId = session.metadata?.playerId
    const itemId = session.metadata?.itemId
    if (playerId && itemId && session.id) {
      await handleCheckoutCompleted(playerId, itemId, session.id)
    }
  }

  return event.type
}

async function grantShopReward(playerId: string, itemId: string) {
  const item = getItem(itemId)
  const player = await PlayerModel.findById(playerId)

  if (!item || !player) {
    throw new Error('Unable to grant reward.')
  }

  if (item.type === 'cosmetic' && !player.cosmetics.includes(item.reward)) {
    player.cosmetics.push(item.reward)
  }

  if (item.type === 'battle-pass') {
    player.battlePassXp += 100
    player.battlePassLevel = 1 + Math.floor(player.battlePassXp / 100)
  }

  if (item.type === 'booster') {
    player.gems += 50
  }

  await player.save()
}
