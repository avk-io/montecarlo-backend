import Escrow from "./escrow.model";
import { EscrowEngine } from "./escrow.engine";
import { Actor } from "./actor";
import { EscrowState } from "./state";
import mongoose from "mongoose";
import { ForbiddenActorError } from "./errors";
import User from "../models/user.model";

const engine = new EscrowEngine();

export async function createEscrow(
    userId: string,
    data: {
        listingId: string;
        sellerId: string;
        amount: number;
    }
) {
    const escrow = await Escrow.create({
        listingId: new mongoose.Types.ObjectId(data.listingId),
        buyerId: new mongoose.Types.ObjectId(userId),
        sellerId: new mongoose.Types.ObjectId(data.sellerId),
        amount: data.amount,
        state: EscrowState.CREATED,
        history: [],
    });

    return escrow;
}

export async function transitionEscrowInternal(
    escrowId:string,
    actor:Actor,
    nextState:EscrowState
){
    const escrow = await Escrow.findById(escrowId);
    if(!escrow){
        throw new Error("Escrow not found");
    }

    const res = engine.transition(
        escrow,
        actor,
        nextState
    );
    await escrow.save();
    return res;
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
    } else{
        const user = await User.findById(userId);
        if(user?.isAdmin){
            actor = Actor.ADMIN;
        }else{
            throw new ForbiddenActorError(userId,escrowId);
        }
    }

    const result = engine.transition(
        escrow,
        actor,
        nextState
    );

    await escrow.save();

    return result;
}