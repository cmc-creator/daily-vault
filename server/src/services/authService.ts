import { randomBytes, scrypt as baseScrypt } from 'crypto'
import { promisify } from 'util'

import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const scrypt = promisify(baseScrypt)

declare global {
  namespace Express {
    interface Request {
      auth?: {
        playerId: string
        username: string
      }
    }
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is required.')
  }

  return secret
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(':')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return storedHash === derivedKey.toString('hex')
}

export function signToken(playerId: string, username: string) {
  return jwt.sign({ sub: playerId, username }, getJwtSecret(), { expiresIn: '7d' })
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Authentication is required.' })
    return
  }

  try {
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string; username: string }
    request.auth = { playerId: payload.sub, username: payload.username }
    next()
  } catch {
    response.status(401).json({ message: 'Invalid session token.' })
  }
}
