import Escrow from "./escrow.model";
import { EscrowEngine } from "./escrow.engine";
import { Actor } from "./actor";
import { EscrowState } from "./state";
import mongoose from "mongoose";
import { ForbiddenActorError } from "./errors";
import User from "../models/user.model";
import { createEscrowSubaddress, getSubaddressBalance } from "./escrow.wallet.service";

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

    const MIN_ORDER_AMOUNT_XMR = 0.001;

    if(data.amount<MIN_ORDER_AMOUNT_XMR){
        throw new Error(`amount too small -minimum order is ${MIN_ORDER_AMOUNT_XMR} XMR (network fees would consume most or all of a smaller payment)`);
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

// Add this import alongside the existing ones at the top of escrow.service.ts:
// import { getSubaddressBalance } from "./escrow.wallet.service";
// (it may already be imported if createEscrow or another function pulls from
// this file — check before adding a duplicate import line)

export async function getFlaggedEscrows() {
    const hardCutOff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Cheap DB query first: every WAITING_FOR_PAYMENT escrow old enough to
    // be past the hard ceiling. This mirrors escrow.cron.ts's own query,
    // deliberately kept in sync with it — if that cutoff ever changes,
    // this needs to change too.
    const candidates = await Escrow.find({
        state: EscrowState.WAITING_FOR_PAYMENT,
        updatedAt: { $lte: hardCutOff },
    });

    // Balance can only be checked live against wallet-rpc, not filtered
    // in the MongoDB query itself — so we check each candidate individually.
    // This is the same per-escrow check the cron already does; we're just
    // surfacing the result instead of acting on it.
    const flagged = [];

    for (const escrow of candidates) {
        try {
            const { balance } = await getSubaddressBalance(
                escrow.depositAddressIndex
            );

            if (balance > 0) {
                flagged.push({
                    ...escrow.toObject(),
                    flaggedBalance: balance,
                });
            }
            // balance === 0 candidates are skipped here — those get
            // auto-expired by the cron on its own, nothing for an admin
            // to review.
        } catch (err) {
            // If we can't even check this one (wallet-rpc down, etc.),
            // don't silently drop it — surface it as flagged too, since
            // "we don't know" is not the same as "safe to ignore."
            flagged.push({
                ...escrow.toObject(),
                flaggedBalance: null,
                checkError: (err as Error).message,
            });
        }
    }

    return flagged;
}