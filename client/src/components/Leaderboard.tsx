import type { LeaderboardEntry } from '../types'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section className="panel">
      <div className="row between">
        <div>
          <p className="eyebrow">Live standings</p>
          <h2>Leaderboard</h2>
        </div>
        <p className="muted">Updates instantly when a player finishes a run.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Floor</th>
              <th>Finished</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.playerId}-${entry.rank}`}>
                <td>#{entry.rank}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{entry.floor}</td>
                <td>{new Date(entry.completedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5}>No completed runs yet. Be the first to finish today.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
