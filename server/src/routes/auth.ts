import { Router } from 'express'
import { z } from 'zod'

import { PlayerModel } from '../models/Player'
import { hashPassword, signToken, verifyPassword } from '../services/authService'

const router = Router()

const authSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(6).max(128),
})

function toPlayerSummary(player: any) {
  return {
    id: String(player._id),
    username: player.username,
    gems: player.gems,
    cosmetics: player.cosmetics,
    equippedCosmetic: player.equippedCosmetic,
    battlePassXp: player.battlePassXp,
    battlePassLevel: player.battlePassLevel,
    wins: player.wins,
    losses: player.losses,
  }
}

router.post('/register', async (request, response) => {
  const payload = authSchema.safeParse(request.body)
  if (!payload.success) {
    response.status(400).json({ message: 'Invalid registration details.' })
    return
  }

  const existing = await PlayerModel.findOne({ username: payload.data.username })
  if (existing) {
    response.status(409).json({ message: 'Username is already in use.' })
    return
  }

  const player = await PlayerModel.create({
    username: payload.data.username,
    passwordHash: await hashPassword(payload.data.password),
  })

  response.status(201).json({
    token: signToken(String(player._id), player.username),
    player: toPlayerSummary(player),
  })
})

router.post('/login', async (request, response) => {
  const payload = authSchema.safeParse(request.body)
  if (!payload.success) {
    response.status(400).json({ message: 'Invalid login details.' })
    return
  }

  const player = await PlayerModel.findOne({ username: payload.data.username })
  if (!player || !(await verifyPassword(payload.data.password, player.passwordHash))) {
    response.status(401).json({ message: 'Incorrect username or password.' })
    return
  }

  response.json({
    token: signToken(String(player._id), player.username),
    player: toPlayerSummary(player),
  })
})

export { router as authRouter, toPlayerSummary }
