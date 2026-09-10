import { Router } from 'express'

import { getLeaderboard } from '../services/leaderboardService'

const router = Router()

router.get('/', async (_request, response) => {
  response.json(await getLeaderboard())
})

export { router as leaderboardRouter }
