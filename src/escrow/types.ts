import { Types } from "mongoose";
import { Actor } from "./actor";
import { EscrowState } from "./state";
import { EscrowEvent, eventMap } from "./event";

export interface TransitionResult {
    order: EscrowOrder;
    event: EscrowEvent;
}

export interface HistoryEntry {
    from: EscrowState;
    to: EscrowState;
    actor: Actor;
    timestamp: Date;
}

export interface EscrowOrder {
    listingId: Types.ObjectId;
    buyerId: Types.ObjectId;
    sellerId: Types.ObjectId;

    amount: number;

    state: EscrowState;
    history: HistoryEntry[];
}