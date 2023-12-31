import {Schema, model} from "mongoose"
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

const ticketSchema = new Schema({
    code: {
        type: String,
        unique: true,
      },
      purchase_datetime: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
        required: true,
      },
      purchaser: {
        type: String,
        required: true,
      },
}, { versionKey: false }
)

ticketSchema.pre("save", function (next) {
    if (!this.code) {
        this.code = crypto.randomUUID()
    }
    next()
})

export const ticketModel = model('ticket', ticketSchema)