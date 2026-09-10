import type { RunState } from '../types'

interface GameBoardProps {
  run: RunState | null
  onPlayCard: (cardId: string) => void
  busy: boolean
}

export function GameBoard({ run, onPlayCard, busy }: GameBoardProps) {
  const currentEnemy = run?.encounters.find((encounter) => encounter.status === 'active')

  if (!run) {
    return (
      <section className="panel">
        <h2>No active run</h2>
        <p className="muted">Start a run from the main menu to see the battle board.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="row wrap gap-lg">
        <article className="card stat-card">
          <h2>Vault runner</h2>
          <p>HP: {run.playerHp} / {run.maxPlayerHp}</p>
          <p>Shield: {run.shield}</p>
          <p>Score: {run.score}</p>
          <p>Status: <strong>{run.status}</strong></p>
        </article>
        <article className="card stat-card">
          <h2>Current encounter</h2>
          {currentEnemy ? (
            <>
              <p>{currentEnemy.name}</p>
              <p>HP: {currentEnemy.hp} / {currentEnemy.maxHp}</p>
              <p>Attack: {currentEnemy.attack}</p>
              <p>Reward: {currentEnemy.reward}</p>
            </>
          ) : (
            <p>The vault is quiet. Your run is resolved.</p>
          )}
        </article>
      </div>

      <article className="card">
        <h2>Hand</h2>
        <div className="card-grid">
          {run.hand.map((cardId) => (
            <button
              key={cardId}
              type="button"
              className="game-card"
              disabled={busy || run.status !== 'active'}
              onClick={() => onPlayCard(cardId)}
            >
              {cardId}
            </button>
          ))}
        </div>
      </article>

      <article className="card">
        <h2>Encounter path</h2>
        <div className="encounter-track">
          {run.encounters.map((encounter) => (
            <div key={encounter.enemyId} className={`encounter-pill ${encounter.status}`}>
              <span>{encounter.name}</span>
              <strong>{encounter.status}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <h2>Combat log</h2>
        <ul className="clean-list log-list">
          {run.history.slice().reverse().map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
        </ul>
      </article>
    </section>
  )
}
