import type { Request, Response } from 'express'
import { Router } from 'express'
import { z } from 'zod'

import { requireAuth } from '../services/authService'
import { BATTLE_PASS_REWARDS, SHOP_ITEMS } from '../services/gameService'
import { createCheckoutSession, verifyAndHandleWebhook } from '../services/paymentService'

const router = Router()

const checkoutSchema = z.object({
  itemId: z.string().min(1),
})

router.get('/catalog', (_request, response) => {
  response.json({
    items: SHOP_ITEMS,
    battlePassRewards: BATTLE_PASS_REWARDS,
  })
})

router.post('/checkout-session', requireAuth, async (request, response) => {
  const payload = checkoutSchema.safeParse(request.body)
  if (!payload.success) {
    response.status(400).json({ message: 'Invalid checkout request.' })
    return
  }

  try {
    response.json(await createCheckoutSession(request.auth!.playerId, payload.data.itemId))
  } catch (error) {
    response.status(400).json({ message: (error as Error).message })
  }
})

export async function handleShopWebhook(request: Request, response: Response) {
  try {
    const signature = Array.isArray(request.headers['stripe-signature'])
      ? request.headers['stripe-signature'][0]
      : request.headers['stripe-signature']
    const eventType = await verifyAndHandleWebhook(
      signature,
      request.body as Buffer,
    )
    response.json({ received: true, eventType })
  } catch (error) {
    response.status(400).json({ message: (error as Error).message })
  }
}

export { router as shopRouter }
