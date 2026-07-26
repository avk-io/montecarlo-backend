import { Request, Response } from "express";

import { EscrowState } from "./state";
import {
    createEscrow,
    transitionEscrow,
    transitionEscrowInternal
} from "./escrow.service";

import { success, error } from "../utils/response";
import { Actor } from "./actor";
import Review from "../models/review.model";
import {getMyEscrows} from "./escrow.service"

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