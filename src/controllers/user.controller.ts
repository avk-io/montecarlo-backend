import { Request, Response } from "express";

import User from "../models/user.model";
import { success, error } from "../utils/response";
import {isValidMoneroAddress} from "../escrow/escrow.wallet.service";
interface UpdatePayoutAddressBody {
    payoutAddress: string;
}

export async function updatePayoutAddress(
    req: Request<{}, {}, UpdatePayoutAddressBody>,
    res: Response
) {
    try {
        const userId = (req as any).userId;
        const { payoutAddress } = req.body;

        if (!payoutAddress || typeof payoutAddress !== "string") {
            return error(res, 400, "payoutAddress is required");
        }

        if(!isValidMoneroAddress(payoutAddress)){
            return error(res,400,"Invalid Monero Stagenet Address.");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { payoutAddress },
            { returnDocument: "after" }
        );

        if (!user) {
            return error(res, 404, "User not found");
        }

        return success(res, { payoutAddress: user.payoutAddress });
    } catch (err: any) {
        return error(res, 400, err.message || "Failed to update payout address");
    }
}