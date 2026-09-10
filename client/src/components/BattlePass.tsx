import type { PlayerSummary, ShopCatalog } from '../types'

interface BattlePassProps {
  catalog: ShopCatalog | null
  player: PlayerSummary | null
}

export function BattlePass({ catalog, player }: BattlePassProps) {
  const progress = player ? Math.min((player.battlePassXp % 100) / 100, 1) : 0

  return (
    <section className="panel">
      <div className="row between">
        <div>
          <p className="eyebrow">Season progression</p>
          <h2>Battle pass</h2>
        </div>
        <p className="muted">XP: {player?.battlePassXp ?? 0}</p>
      </div>

      <article className="card">
        <h3>Current progress</h3>
        <div className="progress-shell">
          <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <p>{player ? `Level ${player.battlePassLevel}` : 'Sign in to earn season XP.'}</p>
      </article>

      <div className="grid three-up">
        {catalog?.battlePassRewards.map((reward) => (
          <article key={reward.level} className="card">
            <p className="pill">Level {reward.level}</p>
            <h3>{reward.reward}</h3>
          </article>
        )) ?? <p>Loading rewards…</p>}
      </div>
    </section>
  )
}
