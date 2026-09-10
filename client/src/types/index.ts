export interface PlayerSummary {
  id: string
  username: string
  gems: number
  cosmetics: string[]
  equippedCosmetic: string
  battlePassXp: number
  battlePassLevel: number
  wins: number
  losses: number
}

export interface Encounter {
  enemyId: string
  name: string
  maxHp: number
  hp: number
  attack: number
  reward: number
  status: 'upcoming' | 'active' | 'defeated'
}

export interface RunState {
  id: string
  dateKey: string
  status: 'active' | 'completed' | 'defeated'
  score: number
  floor: number
  playerHp: number
  maxPlayerHp: number
  shield: number
  hand: string[]
  history: string[]
  encounters: Encounter[]
}

export interface DailyChallenge {
  dateKey: string
  seed: number
  previewEnemies: string[]
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  username: string
  score: number
  floor: number
  completedAt: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'cosmetic' | 'booster' | 'battle-pass'
  reward: string
}

export interface BattlePassReward {
  level: number
  reward: string
}

export interface ShopCatalog {
  items: ShopItem[]
  battlePassRewards: BattlePassReward[]
}

export interface AuthResponse {
  token: string
  player: PlayerSummary
}
