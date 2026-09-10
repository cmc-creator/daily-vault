import { Schema, model, models } from 'mongoose'

const EncounterSchema = new Schema(
  {
    enemyId: { type: String, required: true },
    name: { type: String, required: true },
    maxHp: { type: Number, required: true },
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    reward: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'defeated'], required: true },
  },
  { _id: false },
)

const RunSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    dateKey: { type: String, required: true, index: true },
    seed: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'defeated'], default: 'active' },
    score: { type: Number, default: 0 },
    floor: { type: Number, default: 1 },
    playerHp: { type: Number, default: 30 },
    maxPlayerHp: { type: Number, default: 30 },
    shield: { type: Number, default: 0 },
    hand: { type: [String], default: ['strike', 'guard', 'meditate', 'ambush'] },
    history: { type: [String], default: [] },
    encounters: { type: [EncounterSchema], default: [] },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

export const RunModel = models.Run ?? model('Run', RunSchema)
