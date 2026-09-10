import type { DailyChallenge, PlayerSummary } from '../types'

interface MainMenuProps {
  dailyChallenge: DailyChallenge | null
  player: PlayerSummary | null
  authMode: 'login' | 'register'
  username: string
  secret: string
  loading: boolean
  onAuthModeChange: (mode: 'login' | 'register') => void
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onStartRun: () => void
}

export function MainMenu({
  dailyChallenge,
  player,
  authMode,
  username,
  secret,
  loading,
  onAuthModeChange,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onStartRun,
}: MainMenuProps) {
  return (
    <section className="panel hero-panel">
      <div>
        <p className="eyebrow">Daily deckbuilder challenge</p>
        <h1>Daily Vault</h1>
        <p className="lead">
          Draft smart, survive three seeded encounters, and climb the live leaderboard before the
          vault seals for the day.
        </p>
      </div>

      <div className="grid two-up">
        <article className="card">
          <h2>Daily run</h2>
          <p className="muted">Seed: {dailyChallenge?.seed ?? '...'}</p>
          <ul className="clean-list">
            {dailyChallenge?.previewEnemies.map((enemy) => <li key={enemy}>{enemy}</li>) ?? (
              <li>Loading challenge…</li>
            )}
          </ul>
          <button type="button" className="primary-button" disabled={!player} onClick={onStartRun}>
            {player ? 'Enter the vault' : 'Sign in to start'}
          </button>
        </article>

        <article className="card">
          <div className="row between">
            <h2>{authMode === 'login' ? 'Sign in' : 'Create account'}</h2>
            <div className="segmented">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => onAuthModeChange('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => onAuthModeChange('register')}
              >
                Register
              </button>
            </div>
          </div>
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(event) => onUsernameChange(event.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={secret}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </label>
          <button type="button" className="primary-button" disabled={loading} onClick={onSubmit}>
            {loading ? 'Working…' : authMode === 'login' ? 'Login' : 'Register'}
          </button>
        </article>
      </div>
    </section>
  )
}
