import { Schema, model, models } from 'mongoose'

const PurchaseSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    itemId: { type: String, required: true },
    checkoutSessionId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, default: 'stripe' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  },
  { timestamps: true },
)

export const PurchaseModel = models.Purchase ?? model('Purchase', PurchaseSchema)
