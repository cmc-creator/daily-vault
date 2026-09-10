import type { HydratedDocument } from 'mongoose'

import { PlayerModel } from '../models/Player'
import { RunModel } from '../models/Run'

type EncounterStatus = 'upcoming' | 'active' | 'defeated'
type RunStatus = 'active' | 'completed' | 'defeated'

interface EncounterState {
  enemyId: string
  name: string
  maxHp: number
  hp: number
  attack: number
  reward: number
  status: EncounterStatus
}

interface CardDefinition {
  id: string
  name: string
  description: string
  type: 'attack' | 'shield' | 'heal' | 'attack-shield'
  amount: number
  secondary?: number
}

interface EnemyDefinition {
  enemyId: string
  name: string
  maxHp: number
  attack: number
  reward: number
}

const ENEMIES: EnemyDefinition[] = [
  { enemyId: 'slime-warden', name: 'Slime Warden', maxHp: 18, attack: 5, reward: 12 },
  { enemyId: 'ember-fox', name: 'Ember Fox', maxHp: 16, attack: 6, reward: 14 },
  { enemyId: 'vault-drone', name: 'Vault Drone', maxHp: 20, attack: 5, reward: 15 },
  { enemyId: 'thorn-knight', name: 'Thorn Knight', maxHp: 24, attack: 7, reward: 18 },
  { enemyId: 'echo-bat', name: 'Echo Bat', maxHp: 14, attack: 8, reward: 16 },
]

export const CARD_LIBRARY: Record<string, CardDefinition> = {
  strike: { id: 'strike', name: 'Strike', description: 'Deal 8 damage.', type: 'attack', amount: 8 },
  guard: { id: 'guard', name: 'Guard', description: 'Gain 7 shield.', type: 'shield', amount: 7 },
  meditate: { id: 'meditate', name: 'Meditate', description: 'Heal 5 HP.', type: 'heal', amount: 5 },
  ambush: {
    id: 'ambush',
    name: 'Ambush',
    description: 'Deal 6 damage and gain 4 shield.',
    type: 'attack-shield',
    amount: 6,
    secondary: 4,
  },
}

export const SHOP_ITEMS = [
  {
    id: 'rookie-bundle',
    name: 'Rookie Banner',
    description: 'Unlock a starter banner cosmetic.',
    price: 2.99,
    type: 'cosmetic',
    reward: 'Rookie Banner',
  },
  {
    id: 'nebula-cloak',
    name: 'Nebula Cloak',
    description: 'Rare animated cloak cosmetic.',
    price: 4.99,
    type: 'cosmetic',
    reward: 'Nebula Cloak',
  },
  {
    id: 'season-pass',
    name: 'Season Pass Skip',
    description: 'Gain 100 battle pass XP instantly.',
    price: 5.99,
    type: 'battle-pass',
    reward: '+100 battle pass XP',
  },
  {
    id: 'gem-cache',
    name: 'Gem Cache',
    description: 'Receive 50 bonus gems for cosmetics.',
    price: 3.99,
    type: 'booster',
    reward: '+50 gems',
  },
] as const

export const BATTLE_PASS_REWARDS = [
  { level: 1, reward: 'Rookie Banner' },
  { level: 2, reward: 'Vault Spark trail' },
  { level: 3, reward: 'Nebula Cloak' },
]

export function getDailySeed(date = new Date()): number {
  return Number(date.toISOString().slice(0, 10).replaceAll('-', ''))
}

export function getDailyChallenge() {
  const seed = getDailySeed()
  const previewEnemies = buildDailyEncounters(seed).map((enemy) => enemy.name)
  return { dateKey: String(seed), seed, previewEnemies }
}

function buildDailyEncounters(seed: number): EncounterState[] {
  const offset = seed % ENEMIES.length
  return Array.from({ length: 3 }, (_, index) => {
    const enemy = ENEMIES[(offset + index) % ENEMIES.length]
    return {
      ...enemy,
      hp: enemy.maxHp,
      status: index === 0 ? 'active' : 'upcoming',
    }
  })
}

export async function createRunForPlayer(playerId: string) {
  const challenge = getDailyChallenge()
  const run = await RunModel.create({
    player: playerId,
    dateKey: challenge.dateKey,
    seed: challenge.seed,
    encounters: buildDailyEncounters(challenge.seed),
    history: [`Run started for vault seed ${challenge.seed}.`],
  })

  return run
}

function pushHistory(run: HydratedDocument<any>, message: string) {
  run.history.push(message)
  if (run.history.length > 20) {
    run.history = run.history.slice(-20)
  }
}

export async function applyCardToRun(runId: string, playerId: string, cardId: string) {
  const run = await RunModel.findOne({ _id: runId, player: playerId })

  if (!run) {
    throw new Error('Run not found.')
  }

  if (run.status !== 'active') {
    throw new Error('This run has already been resolved.')
  }

  const card = CARD_LIBRARY[cardId]
  if (!card) {
    throw new Error('Unknown card selected.')
  }

  const encounter = run.encounters.find((entry: EncounterState) => entry.status === 'active')
  if (!encounter) {
    throw new Error('No active encounter is available.')
  }

  if (card.type === 'attack' || card.type === 'attack-shield') {
    encounter.hp = Math.max(0, encounter.hp - card.amount)
    pushHistory(run, `${card.name} dealt ${card.amount} damage to ${encounter.name}.`)
  }

  if (card.type === 'shield' || card.type === 'attack-shield') {
    const shieldGain = card.type === 'shield' ? card.amount : (card.secondary ?? 0)
    run.shield += shieldGain
    pushHistory(run, `${card.name} granted ${shieldGain} shield.`)
  }

  if (card.type === 'heal') {
    run.playerHp = Math.min(run.maxPlayerHp, run.playerHp + card.amount)
    pushHistory(run, `${card.name} restored ${card.amount} HP.`)
  }

  if (encounter.hp === 0) {
    encounter.status = 'defeated'
    run.score += encounter.reward
    pushHistory(run, `${encounter.name} was defeated. +${encounter.reward} score.`)

    const nextEncounter = run.encounters.find((entry: EncounterState) => entry.status === 'upcoming')
    if (nextEncounter) {
      nextEncounter.status = 'active'
      run.floor += 1
      run.hand = rotateHand(run.hand)
      pushHistory(run, `${nextEncounter.name} emerges from the vault.`)
    } else {
      run.status = 'completed' as RunStatus
      run.completedAt = new Date()
      pushHistory(run, 'The vault is cleared. Run completed.')
      await rewardPlayer(run.player.toString(), true, run.score)
    }
  } else {
    const incoming = Math.max(encounter.attack - run.shield, 0)
    run.shield = Math.max(run.shield - encounter.attack, 0)
    run.playerHp = Math.max(run.playerHp - incoming, 0)
    pushHistory(run, `${encounter.name} struck back for ${incoming} damage.`)

    if (run.playerHp === 0) {
      run.status = 'defeated' as RunStatus
      run.completedAt = new Date()
      pushHistory(run, 'You were defeated inside the vault.')
      await rewardPlayer(run.player.toString(), false, run.score)
    }
  }

  await run.save()
  return run
}

function rotateHand(hand: string[]) {
  if (hand.length === 0) return hand
  return [...hand.slice(1), hand[0]]
}

async function rewardPlayer(playerId: string, won: boolean, score: number) {
  const xpGain = won ? 40 + score : 15 + score
  const gemGain = won ? 25 : 8
  const player = await PlayerModel.findById(playerId)

  if (!player) {
    return
  }

  player.gems += gemGain
  player.battlePassXp += xpGain
  player.battlePassLevel = 1 + Math.floor(player.battlePassXp / 100)
  player.wins += won ? 1 : 0
  player.losses += won ? 0 : 1
  await player.save()
}
