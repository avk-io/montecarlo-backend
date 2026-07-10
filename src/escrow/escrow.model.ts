import mongoose, { Schema, Document } from "mongoose";
import { EscrowState } from "./state";
import { Actor } from "./actor";
import { EscrowOrder } from "./types";

export interface IEscrow extends Document, EscrowOrder {}

const historySchema = new Schema(
  {
    from: {
      type: String,
      enum: Object.values(EscrowState),
      required: true,
    },
    to: {
      type: String,
      enum: Object.values(EscrowState),
      required: true,
    },
    actor: {
      type: String,
      enum: Object.values(Actor),
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const escrowSchema = new Schema<IEscrow>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    state: {
      type: String,
      enum: Object.values(EscrowState),
      default: EscrowState.CREATED,
    },

    history: {
      type: [historySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEscrow>("Escrow", escrowSchema);