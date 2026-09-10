import { Router } from 'express'
import { z } from 'zod'

import { RunModel } from '../models/Run'
import { requireAuth } from '../services/authService'
import { applyCardToRun, createRunForPlayer, getDailyChallenge } from '../services/gameService'
import { runRateLimiter } from '../services/rateLimit'
import { broadcastLeaderboardUpdate } from '../websocket/socket'

const router = Router()
router.use(runRateLimiter)

const actionSchema = z.object({
  cardId: z.string().min(1),
})

function toRunResponse(run: any) {
  return {
    id: String(run._id),
    dateKey: run.dateKey,
    status: run.status,
    score: run.score,
    floor: run.floor,
    playerHp: run.playerHp,
    maxPlayerHp: run.maxPlayerHp,
    shield: run.shield,
    hand: run.hand,
    history: run.history,
    encounters: run.encounters,
  }
}

router.get('/daily', async (_request, response) => {
  response.json(getDailyChallenge())
})

router.post('/', requireAuth, async (request, response) => {
  const run = await createRunForPlayer(request.auth!.playerId)
  response.status(201).json(toRunResponse(run))
})

router.get('/:runId', requireAuth, async (request, response) => {
  const run = await RunModel.findOne({ _id: request.params.runId, player: request.auth!.playerId })
  if (!run) {
    response.status(404).json({ message: 'Run not found.' })
    return
  }

  response.json(toRunResponse(run))
})

router.post('/:runId/actions', requireAuth, async (request, response) => {
  const payload = actionSchema.safeParse(request.body)
  if (!payload.success) {
    response.status(400).json({ message: 'Invalid card action.' })
    return
  }

  try {
    const runId = Array.isArray(request.params.runId) ? request.params.runId[0] : request.params.runId
    const run = await applyCardToRun(runId, request.auth!.playerId, payload.data.cardId)
    if (run.status === 'completed') {
      await broadcastLeaderboardUpdate()
    }
    response.json(toRunResponse(run))
  } catch (error) {
    response.status(400).json({ message: (error as Error).message })
  }
})

export { router as runsRouter }
