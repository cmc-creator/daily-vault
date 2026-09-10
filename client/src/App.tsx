import { useEffect, useMemo, useState } from 'react'

import './App.css'
import { BattlePass } from './components/BattlePass'
import { GameBoard } from './components/GameBoard'
import { Leaderboard } from './components/Leaderboard'
import { MainMenu } from './components/MainMenu'
import { Profile } from './components/Profile'
import { Shop } from './components/Shop'
import { apiClient, subscribeToLeaderboard } from './services/apiClient'
import type { DailyChallenge, LeaderboardEntry, PlayerSummary, RunState, ShopCatalog } from './types'

type Screen = 'menu' | 'game' | 'leaderboard' | 'shop' | 'profile' | 'battle-pass'

const TOKEN_STORAGE_KEY = 'daily-vault-token'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [username, setUsername] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [player, setPlayer] = useState<PlayerSummary | null>(null)
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [catalog, setCatalog] = useState<ShopCatalog | null>(null)
  const [run, setRun] = useState<RunState | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Welcome to the vault.')

  useEffect(() => {
    void Promise.all([
      apiClient.getDailyChallenge().then(setDailyChallenge),
      apiClient.getLeaderboard().then(setLeaderboard),
      apiClient.getShopCatalog().then(setCatalog),
    ]).catch((error: Error) => setMessage(error.message))
  }, [])

  useEffect(() => {
    if (!token) {
      setPlayer(null)
      return
    }

    void apiClient
      .getProfile(token)
      .then(setPlayer)
      .catch((error: Error) => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setMessage(error.message)
      })
  }, [token])

  useEffect(() => subscribeToLeaderboard(setLeaderboard), [])

  const navigation = useMemo(
    () => [
      ['menu', 'Menu'],
      ['game', 'Game'],
      ['leaderboard', 'Leaderboard'],
      ['shop', 'Shop'],
      ['profile', 'Profile'],
      ['battle-pass', 'Battle Pass'],
    ] as const,
    [],
  )

  const persistSession = (nextToken: string, nextPlayer: PlayerSummary) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    setToken(nextToken)
    setPlayer(nextPlayer)
    setMessage(`Welcome back, ${nextPlayer.username}.`)
  }

  const handleAuth = async () => {
    setBusy(true)

    try {
      const response =
        authMode === 'login'
          ? await apiClient.login(username, secret)
          : await apiClient.register(username, secret)

      persistSession(response.token, response.player)
      setScreen('menu')
      setSecret('')
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleStartRun = async () => {
    if (!token) return
    setBusy(true)

    try {
      const nextRun = await apiClient.startRun(token)
      setRun(nextRun)
      setScreen('game')
      setMessage(`Run started for ${nextRun.dateKey}.`)
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handlePlayCard = async (cardId: string) => {
    if (!token || !run) return
    setBusy(true)

    try {
      const nextRun = await apiClient.playCard(token, run.id, cardId)
      setRun(nextRun)
      if (nextRun.status !== 'active') {
        const profile = await apiClient.getProfile(token)
        setPlayer(profile)
      }
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handlePurchase = async (itemId: string) => {
    if (!token) return
    setBusy(true)

    try {
      const response = await apiClient.createCheckoutSession(token, itemId)
      setMessage(response.message)
      if (response.checkoutUrl) {
        window.open(response.checkoutUrl, '_blank', 'noopener,noreferrer')
      }
      const profile = await apiClient.getProfile(token)
      setPlayer(profile)
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleEquip = async (equippedCosmetic: string) => {
    if (!token) return

    try {
      const profile = await apiClient.updateProfile(token, { equippedCosmetic })
      setPlayer(profile)
      setMessage(`${equippedCosmetic} equipped.`)
    } catch (error) {
      setMessage((error as Error).message)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Reactive daily roguelike</p>
          <strong>Daily Vault</strong>
        </div>
        <nav className="nav-tabs">
          {navigation.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={screen === id ? 'active' : ''}
              onClick={() => setScreen(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {screen === 'menu' ? (
          <MainMenu
            dailyChallenge={dailyChallenge}
            player={player}
            authMode={authMode}
            username={username}
            secret={secret}
            loading={busy}
            onAuthModeChange={setAuthMode}
            onUsernameChange={setUsername}
            onPasswordChange={setSecret}
            onSubmit={handleAuth}
            onStartRun={handleStartRun}
          />
        ) : null}
        {screen === 'game' ? <GameBoard run={run} onPlayCard={handlePlayCard} busy={busy} /> : null}
        {screen === 'leaderboard' ? <Leaderboard entries={leaderboard} /> : null}
        {screen === 'shop' ? (
          <Shop catalog={catalog} player={player} busy={busy} onPurchase={handlePurchase} />
        ) : null}
        {screen === 'profile' ? <Profile player={player} onEquip={handleEquip} /> : null}
        {screen === 'battle-pass' ? <BattlePass catalog={catalog} player={player} /> : null}
      </main>

      <footer className="status-bar">
        <span>{message}</span>
        <span>{player ? `${player.username} • ${player.gems} gems` : 'Guest mode'}</span>
      </footer>
    </div>
  )
}

export default App
