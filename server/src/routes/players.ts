import { Router } from 'express'
import { z } from 'zod'

import { PlayerModel } from '../models/Player'
import { requireAuth } from '../services/authService'
import { toPlayerSummary } from './auth'

const router = Router()

const profileUpdateSchema = z.object({
  equippedCosmetic: z.string().min(1),
})

router.get('/me', requireAuth, async (request, response) => {
  const player = await PlayerModel.findById(request.auth?.playerId)
  if (!player) {
    response.status(404).json({ message: 'Player not found.' })
    return
  }

  response.json(toPlayerSummary(player))
})

router.patch('/me', requireAuth, async (request, response) => {
  const payload = profileUpdateSchema.safeParse(request.body)
  if (!payload.success) {
    response.status(400).json({ message: 'Invalid profile update.' })
    return
  }

  const player = await PlayerModel.findById(request.auth?.playerId)
  if (!player) {
    response.status(404).json({ message: 'Player not found.' })
    return
  }

  if (!player.cosmetics.includes(payload.data.equippedCosmetic)) {
    response.status(400).json({ message: 'You do not own that cosmetic.' })
    return
  }

  player.equippedCosmetic = payload.data.equippedCosmetic
  await player.save()

  response.json(toPlayerSummary(player))
})

export { router as playersRouter }
