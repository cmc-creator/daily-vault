import type { Server as HttpServer } from 'http'

import { Server } from 'socket.io'

import { getLeaderboard } from '../services/leaderboardService'

let io: Server | null = null

export function createSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
      credentials: true,
    },
  })

  io.on('connection', async (socket) => {
    socket.emit('leaderboard:update', await getLeaderboard())
  })

  return io
}

export async function broadcastLeaderboardUpdate() {
  if (!io) {
    return
  }

  io.emit('leaderboard:update', await getLeaderboard())
}
