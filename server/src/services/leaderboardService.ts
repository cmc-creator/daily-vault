import { RunModel } from '../models/Run'

export async function getLeaderboard(limit = 10) {
  const runs = await RunModel.find({ status: 'completed' })
    .sort({ score: -1, completedAt: 1 })
    .limit(limit)
    .populate('player', 'username')
    .lean()

  return runs.map((run, index) => ({
    rank: index + 1,
    playerId: String(run.player?._id ?? ''),
    username: (run.player as { username?: string } | null)?.username ?? 'Unknown',
    score: run.score,
    floor: run.floor,
    completedAt: run.completedAt ?? run.updatedAt,
  }))
}
