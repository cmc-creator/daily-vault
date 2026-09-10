import type { PlayerSummary, ShopCatalog } from '../types'

interface ShopProps {
  catalog: ShopCatalog | null
  player: PlayerSummary | null
  busy: boolean
  onPurchase: (itemId: string) => void
}

export function Shop({ catalog, player, busy, onPurchase }: ShopProps) {
  return (
    <section className="panel">
      <div className="row between">
        <div>
          <p className="eyebrow">Monetization ready</p>
          <h2>Vault shop</h2>
        </div>
        <p className="muted">Gems: {player?.gems ?? '—'}</p>
      </div>
      <div className="grid three-up">
        {catalog?.items.map((item) => (
          <article key={item.id} className="card">
            <p className="pill">{item.type}</p>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p className="reward-text">Reward: {item.reward}</p>
            <button
              type="button"
              className="primary-button"
              disabled={!player || busy}
              onClick={() => onPurchase(item.id)}
            >
              {busy ? 'Processing…' : `$${item.price.toFixed(2)}`}
            </button>
          </article>
        )) ?? <p>Loading shop…</p>}
      </div>
    </section>
  )
}
