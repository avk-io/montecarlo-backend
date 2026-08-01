import { Request, Response } from "express";

import { executePayout } from "./escrow.payout.service";
import { success, error } from "../utils/response";

export async function triggerPayout(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const result = await executePayout(req.params.id);
        return success(res, {
            escrowId: req.params.id,
            ...result,
        });
    } catch (err: any) {
        return error(res, 400, err.message || "Payout failed");
    }
}