import cron from "node-cron";
import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import { Actor } from "./actor";
import { transitionEscrowInternal } from "./escrow.service";
import { executePayout } from "./escrow.payout.service";

export function startEscrowReleaseJob() {
    cron.schedule("*/5 * * * *", async () => {
        console.log("[EscrowReleaseJob] Starting auto-release sweep...");
        try {
            const gracePeriod = new Date(Date.now() - 60 * 60 * 1000);

            const escrows = await Escrow.find({
                state: EscrowState.BUYER_CONFIRMED,
                updatedAt: { $lte: gracePeriod },
            });

            let released = 0;
            let paidOut = 0;
            let payoutFailed = 0;
            let failed = 0;

            for (const escrow of escrows) {
                try {
                    await transitionEscrowInternal(
                        escrow._id.toString(),
                        Actor.SYSTEM,
                        EscrowState.RELEASED
                    );
                    released++;

                    // Immediately attempt payout now that the order is
                    // RELEASED. This is a separate try/catch from the
                    // transition above on purpose: if the transition
                    // succeeded but payout fails (wallet-rpc down, no
                    // payout address, etc.), the order should stay
                    // correctly RELEASED rather than getting rolled back
                    // or blocked — it just needs a retry on payout later.
                    try {
                        await executePayout(escrow._id.toString());
                        paidOut++;
                    } catch (payoutErr) {
                        payoutFailed++;
                        console.error(
                            `[EscrowReleaseJob] Released escrow ${escrow._id} but payout failed:`,
                            payoutErr
                        );
                    }
                } catch (err) {
                    failed++;
                    console.error(
                        `[EscrowReleaseJob] Failed to release escrow ${escrow._id}:`,
                        err
                    );
                }
            }

            console.log(
                `[EscrowReleaseJob] Sweep complete. Checked=${escrows.length}, Released=${released}, PaidOut=${paidOut}, PayoutFailed=${payoutFailed}, Failed=${failed}`
            );
        } catch (err) {
            console.error(
                "[EscrowReleaseJob] Sweep failed before processing escrows:",
                err
            );
        }
    });
}