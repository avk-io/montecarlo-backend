import { Request, Response } from "express";

import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import User from "../models/user.model";
import { getSubaddressBalance, sweepEscrowFunds } from "./escrow.wallet.service";
import { success, error } from "../utils/response";

export async function triggerPayout(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const escrow = await Escrow.findById(req.params.id);

        if (!escrow) {
            return error(res, 404, "Escrow not found");
        }

        if (escrow.payoutTxHash) {
            return error(
                res,
                400,
                `Escrow already paid out (tx: ${escrow.payoutTxHash})`
            );
        }

        let recipientUserId: string;

        if (escrow.state === EscrowState.RELEASED) {
            recipientUserId = escrow.sellerId.toString();
        } else if (escrow.state === EscrowState.REFUNDED) {
            recipientUserId = escrow.buyerId.toString();
        } else {
            return error(
                res,
                400,
                `Escrow is in state ${escrow.state}, not eligible for payout. Must be RELEASED or REFUNDED first.`
            );
        }

        const recipient = await User.findById(recipientUserId);

        if (!recipient?.payoutAddress) {
            return error(res, 400, "Recipient has no payout address on file");
        }

        const { unlockedBalance } = await getSubaddressBalance(
            escrow.depositAddressIndex
        );

        if (unlockedBalance <= 0) {
            return error(
                res,
                400,
                "No confirmed balance available to pay out for this escrow"
            );
        }

        const reserved = await Escrow.findOneAndUpdate(
            { _id: escrow._id, payoutTxHash: null },
            { $set: { payoutTxHash: "PENDING" } },
            { returnDocument: "after" }
        );

        if (!reserved) {
            return error(
                res,
                409,
                "Payout already in progress or completed for this escrow"
            );
        }

        let txHashes: string[];
        let amountsSwept: number[];
        try {
            const result = await sweepEscrowFunds(
                escrow.depositAddressIndex,
                recipient.payoutAddress
            );
            txHashes = result.txHashes;
            amountsSwept = result.amountsSwept;
        } catch (transferErr) {
            await Escrow.findOneAndUpdate(
                { _id: escrow._id, payoutTxHash: "PENDING" },
                { $set: { payoutTxHash: null } }
            );
            throw transferErr;
        }

        // sweep_all can produce more than one transaction; store them
        // joined so payoutTxHash still works as a simple non-null/idempotency
        // marker, while the full detail is in the response for this call.
        const combinedTxHash = txHashes.join(",");

        await Escrow.findOneAndUpdate(
            { _id: escrow._id, payoutTxHash: "PENDING" },
            { $set: { payoutTxHash: combinedTxHash } }
        );

        return success(res, {
            escrowId: escrow._id,
            txHashes,
            amountsSwept,
            paidTo: recipient.payoutAddress,
        });
    } catch (err: any) {
        return error(res, 400, err.message || "Payout failed");
    }
}