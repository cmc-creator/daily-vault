import rateLimit from 'express-rate-limit'

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

export const playerRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

export const runRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 90,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

export const shopRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})
