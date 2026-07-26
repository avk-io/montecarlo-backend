import Escrow from "./escrow.model";
import { EscrowEngine } from "./escrow.engine";
import { Actor } from "./actor";
import { EscrowState } from "./state";
import mongoose from "mongoose";
import { ForbiddenActorError } from "./errors";
import User from "../models/user.model";
import { createEscrowSubaddress } from "./escrow.wallet.service";

const engine = new EscrowEngine();
// escrow.service.ts — updated createEscrow only. transitionEscrow,
// transitionEscrowInternal, and applyTransition are unchanged from
// before; only the amount-handling in createEscrow changes.

export async function createEscrow(
    userId: string,
    data: {
        listingId: string;
        sellerId: string;
        amount: number; // XMR, e.g. 0.05 — a human-readable decimal, NOT atomic units
    }
) {
    if (data.amount <= 0) {
        throw new Error("amount must be greater than zero");
    }

    // Convert XMR -> atomic units at the boundary, once, here. Everything
    // downstream (funding checks, payout) works in atomic units from this
    // point on. Math.round guards against floating point noise (e.g.
    // 0.1 XMR shouldn't become 99999999999.9999 atomic units).
    const amountAtomic = Math.round(data.amount * 1e12);

    const label = `escrow-${userId}-${data.sellerId}-${Date.now()}`;
    const { address, addressIndex } = await createEscrowSubaddress(label);

    const escrow = await Escrow.create({
        listingId: new mongoose.Types.ObjectId(data.listingId),
        buyerId: new mongoose.Types.ObjectId(userId),
        sellerId: new mongoose.Types.ObjectId(data.sellerId),
        amount: amountAtomic,
        state: EscrowState.CREATED,
        history: [],
        depositAddress: address,
        depositAddressIndex: addressIndex,
    });

    engine.transition(escrow, Actor.BUYER, EscrowState.WAITING_FOR_PAYMENT);
    await escrow.save();

    return escrow;
}

// Shared core: computes the transition against a fresh in-memory copy,
// then persists it with an atomic, conditional update instead of a plain
// save(). If another process already changed the escrow's state between
// our read and this write, the filter below matches zero documents and
// we throw a clear concurrency error instead of silently overwriting
// whatever the other process just wrote.
async function applyTransition(
    escrowId: string,
    actor: Actor,
    nextState: EscrowState
) {
    const escrow = await Escrow.findById(escrowId);

    if (!escrow) {
        throw new Error("Escrow not found");
    }

    const stateBeforeTransition = escrow.state;

    // engine.transition validates + mutates this in-memory copy, and
    // pushes the new history entry onto escrow.history in memory.
    const result = engine.transition(escrow, actor, nextState);

    const updated = await Escrow.findOneAndUpdate(
        {
            _id: escrowId,
            state: stateBeforeTransition, // only matches if nothing else changed it since we read it
        },
        {
            $set: { state: escrow.state },
            $push: { history: escrow.history[escrow.history.length - 1] },
        },
        { returnDocument: "after" }
    );

    if (!updated) {
        throw new Error(
            `Concurrent modification detected: escrow ${escrowId} was changed by another operation before this transition could be applied`
        );
    }

    result.order = updated;
    return result;
}

export async function transitionEscrow(
    escrowId: string,
    userId: string,
    nextState: EscrowState
) {
    const escrow = await Escrow.findById(escrowId);

    if (!escrow) {
        throw new Error("Escrow not found");
    }

    let actor: Actor;

    if (userId === escrow.buyerId.toString()) {
        actor = Actor.BUYER;
    } else if (userId === escrow.sellerId.toString()) {
        actor = Actor.SELLER;
    } else {
        const user = await User.findById(userId);
        if (user?.isAdmin) {
            actor = Actor.ADMIN;
        } else {
            throw new ForbiddenActorError(userId, escrowId);
        }
    }

    return applyTransition(escrowId, actor, nextState);
}

export async function transitionEscrowInternal(
    escrowId: string,
    actor: Actor,
    nextState: EscrowState
) {
    return applyTransition(escrowId, actor, nextState);
}

export async function getMyEscrows(userId:string){
    return Escrow.find({
        $or: [{buyerId: userId}, {sellerId:userId}],
    }).sort({createdAt: -1});
}