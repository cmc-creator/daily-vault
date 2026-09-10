import type { PlayerSummary } from '../types'

interface ProfileProps {
  player: PlayerSummary | null
  onEquip: (equippedCosmetic: string) => void
}

export function Profile({ player, onEquip }: ProfileProps) {
  if (!player) {
    return (
      <section className="panel">
        <h2>Profile</h2>
        <p className="muted">Log in to manage your runner profile.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="row between">
        <div>
          <p className="eyebrow">Player profile</p>
          <h2>{player.username}</h2>
        </div>
        <span className="pill">Equipped: {player.equippedCosmetic}</span>
      </div>

      <div className="grid three-up">
        <article className="card stat-card">
          <h3>Wins</h3>
          <p>{player.wins}</p>
        </article>
        <article className="card stat-card">
          <h3>Losses</h3>
          <p>{player.losses}</p>
        </article>
        <article className="card stat-card">
          <h3>Battle pass</h3>
          <p>Level {player.battlePassLevel}</p>
        </article>
      </div>

      <article className="card">
        <h3>Owned cosmetics</h3>
        <div className="encounter-track">
          {player.cosmetics.map((cosmetic) => (
            <button
              key={cosmetic}
              type="button"
              className={`encounter-pill ${cosmetic === player.equippedCosmetic ? 'active-pill' : ''}`}
              onClick={() => onEquip(cosmetic)}
            >
              {cosmetic}
            </button>
          ))}
        </div>
      </article>
    </section>
  )
}
