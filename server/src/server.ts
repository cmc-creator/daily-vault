import 'dotenv/config'

import http from 'http'

import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import { authRouter } from './routes/auth'
import { leaderboardRouter } from './routes/leaderboard'
import { playersRouter } from './routes/players'
import { runsRouter } from './routes/runs'
import { handleShopWebhook, shopRouter } from './routes/shop'
import { shopRateLimiter } from './services/rateLimit'
import { createSocketServer } from './websocket/socket'

const app = express()
const server = http.createServer(app)

app.post('/api/shop/webhook', shopRateLimiter, express.raw({ type: 'application/json' }), handleShopWebhook)

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/players', playersRouter)
app.use('/api/runs', runsRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/shop', shopRouter)

createSocketServer(server)

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required.')
  }

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await mongoose.connect(mongoUri)
      return
    } catch (error) {
      if (attempt === 10) {
        throw error
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 2000)
      })
    }
  }
}

async function bootstrap() {
  await connectToDatabase()
  const port = Number(process.env.PORT ?? 4000)
  server.listen(port, () => {
    console.log(`Daily Vault server listening on ${port}`)
  })
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
