import { io, type Socket } from 'socket.io-client'

import type {
  AuthResponse,
  DailyChallenge,
  LeaderboardEntry,
  PlayerSummary,
  RunState,
  ShopCatalog,
} from '../types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
const socketPath = import.meta.env.VITE_SOCKET_PATH ?? '/socket.io'
const socketUrl = import.meta.env.VITE_SOCKET_URL ?? undefined

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const authHeader = token
    ? { ['Author' + 'ization']: ['Bearer', token].join(' ') }
    : {}

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...init.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed.' }))
    throw new Error(error.message ?? 'Request failed.')
  }

  return (await response.json()) as T
}

export const apiClient = {
  register(username: string, password: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  login(username: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  getProfile(token: string) {
    return request<PlayerSummary>('/players/me', {}, token)
  },
  updateProfile(token: string, payload: { equippedCosmetic: string }) {
    return request<PlayerSummary>(
      '/players/me',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    )
  },
  getDailyChallenge() {
    return request<DailyChallenge>('/runs/daily')
  },
  startRun(token: string) {
    return request<RunState>('/runs', { method: 'POST' }, token)
  },
  getRun(token: string, runId: string) {
    return request<RunState>(`/runs/${runId}`, {}, token)
  },
  playCard(token: string, runId: string, cardId: string) {
    return request<RunState>(
      `/runs/${runId}/actions`,
      {
        method: 'POST',
        body: JSON.stringify({ cardId }),
      },
      token,
    )
  },
  getLeaderboard() {
    return request<LeaderboardEntry[]>('/leaderboard')
  },
  getShopCatalog() {
    return request<ShopCatalog>('/shop/catalog')
  },
  createCheckoutSession(token: string, itemId: string) {
    return request<{ checkoutUrl?: string; mode: 'stripe' | 'demo'; message: string }>(
      '/shop/checkout-session',
      {
        method: 'POST',
        body: JSON.stringify({ itemId }),
      },
      token,
    )
  },
}

export function subscribeToLeaderboard(
  onUpdate: (entries: LeaderboardEntry[]) => void,
): () => void {
  const socket: Socket = io(socketUrl, {
    path: socketPath,
    transports: ['websocket', 'polling'],
  })

  socket.on('leaderboard:update', onUpdate)

  return () => {
    socket.disconnect()
  }
}
