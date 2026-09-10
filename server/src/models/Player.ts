import { Schema, model, models } from 'mongoose'

const PlayerSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    passwordHash: { type: String, required: true },
    gems: { type: Number, default: 100 },
    cosmetics: { type: [String], default: ['Rookie Banner'] },
    equippedCosmetic: { type: String, default: 'Rookie Banner' },
    battlePassXp: { type: Number, default: 0 },
    battlePassLevel: { type: Number, default: 1 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const PlayerModel = models.Player ?? model('Player', PlayerSchema)
