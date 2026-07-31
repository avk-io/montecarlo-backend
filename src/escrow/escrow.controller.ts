import { Request, Response } from "express";

import { EscrowState } from "./state";
import {
    createEscrow,
    getFlaggedEscrows,
    transitionEscrow,
    transitionEscrowInternal
} from "./escrow.service";

import { success, error } from "../utils/response";
import { Actor } from "./actor";
import Review from "../models/review.model";
import {getMyEscrows} from "./escrow.service"
import mongoose from "mongoose";
import Escrow from "./escrow.model";
import User from "../models/user.model";

interface CreateEscrowBody {
    listingId: string;
    sellerId: string;
    amount: number;
}

interface TransitionBody {
    nextState: EscrowState;
}

export async function createEscrowController(
    req: Request<{}, {}, CreateEscrowBody>,
    res: Response
) {
    try {
        const userId = (req as any).userId;

        const escrow = await createEscrow(userId, req.body);

        return success(res, escrow);
    } catch (err: any) {
        return error(
            res,
            400,
            err.message || "Failed to create escrow"
        );
    }
}

export async function transitionEscrowController(
    req: Request<{ id: string }, {}, TransitionBody>,
    res: Response
) {
    try {
        const userId = (req as any).userId;

        const result = await transitionEscrow(
            req.params.id,
            userId,
            req.body.nextState
        );

        return success(res, result);
    } catch (err: any) {
        return error(
            res,
            400,
            err.message || "Transition failed"
        );
    }
}

export async function systemTransitionController(
    req: Request<{id:string},{}, TransitionBody>,
    res: Response
){
    try{

        const result = await transitionEscrowInternal(
            req.params.id,
            Actor.SYSTEM,
            req.body.nextState
        );
        return success(res,result);
    }catch(err:any){
        return error(
            res,
            400,
            err.message || "System transition failed"
        );
    }
}

export async function walletTransitionController(
    req: Request<{id:string},{}, TransitionBody>,
    res: Response
){
    try{
        const result = await transitionEscrowInternal(
            req.params.id,
            Actor.WALLET,
            req.body.nextState
        );
        return success(res,result);
    }catch(err:any){
        return error(
            res,
            400,
            err.message || "Wallet transition failed"
        );
    }
}

export async function getMyEscrowsController(req:Request,res:Response){
    try{
        const userId = (req as any).userId;
        const escrows = await getMyEscrows(userId);
        return success(res,escrows);
    }catch(err:any){
        return error(res,400,err.message || "Failed to fetch escrows");
    }
}
export const getEscrowController = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const userId = (req as any).userId;

        const escrow = await Escrow.findById(req.params.id);

        if (!escrow) {
            return error(res, 404, "Escrow not found");
        }

        const isBuyer = escrow.buyerId.toString() === userId;
        const isSeller = escrow.sellerId.toString() === userId;

        if (!isBuyer && !isSeller) {
            const user = await User.findById(userId);

            if (!user?.isAdmin) {
                return error(
                    res,
                    403,
                    `User ${userId} cannot access escrow ${escrow._id}: no relationship to this order`
                );
            }
        }

        return success(res, escrow);
    } catch (err: any) {
        return error(res, 400, err.message || "Failed to fetch escrow");
    }
};

export async function getFlaggedEscrowsController(req: Request, res: Response) {
    try {
        const flagged = await getFlaggedEscrows();
        return success(res, flagged);
    } catch (err: any) {
        return error(res, 400, err.message || "Failed to fetch flagged escrows");
    }
}

