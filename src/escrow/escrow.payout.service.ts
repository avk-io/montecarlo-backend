import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import User from "../models/user.model";
import { getSubaddressBalance, sweepEscrowFunds } from "./escrow.wallet.service";

export async function executePayout(escrowId: string) {
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    throw new Error("Escrow not found");
  }

  if (escrow.payoutTxHash && escrow.payoutTxHash !== "PENDING") {
    throw new Error(`Escrow already paid out (tx: ${escrow.payoutTxHash})`);
  }

  let recipientUserId: string;

  if (escrow.state === EscrowState.RELEASED) {
    recipientUserId = escrow.sellerId.toString();
  } else if (escrow.state === EscrowState.REFUNDED) {
    recipientUserId = escrow.buyerId.toString();
  } else {
    throw new Error(
      `Escrow is in state ${escrow.state}, not eligible for payout`
    );
  }

  const recipient = await User.findById(recipientUserId);
  if (!recipient?.payoutAddress) {
    throw new Error("Recipient has no payout address on file");
  }

  const { unlockedBalance } = await getSubaddressBalance(
    escrow.depositAddressIndex
  );

  if (unlockedBalance <= 0) {
    throw new Error("No confirmed balance available to pay out");
  }

  // Lock
  const reserved = await Escrow.findOneAndUpdate(
    { _id: escrow._id, payoutTxHash: null },
    { $set: { payoutTxHash: "PENDING" } },
    { returnDocument: "after" }
  );

  if (!reserved) {
    throw new Error("Payout already in progress or completed");
  }

  try {
    const { txHashes, amountsSwept } = await sweepEscrowFunds(
      escrow.depositAddressIndex,
      recipient.payoutAddress
    );

    const combinedTxHash = txHashes.join(",");

    await Escrow.findOneAndUpdate(
      { _id: escrow._id, payoutTxHash: "PENDING" },
      {
        $set: {
          payoutTxHash: combinedTxHash,
          payoutStatus: "SENT",
        },
      }
    );

    return { txHashes, amountsSwept, paidTo: recipient.payoutAddress };
  } catch (err) {
    await Escrow.findOneAndUpdate(
      { _id: escrow._id, payoutTxHash: "PENDING" },
      { $set: { payoutTxHash: null, payoutStatus: "FAILED" } }
    );
    throw err;
  }
}