import cron from "node-cron";
import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import { Actor } from "./actor";
import { transitionEscrowInternal } from "./escrow.service";
import { getSubaddressBalance } from "./escrow.wallet.service";

export function startEscrowPaymentDetectionJob() {
    cron.schedule("*/5 * * * *", async () => {
        console.log("[EscrowPaymentJob] Starting payment detection sweep...");
        try {
            const escrows = await Escrow.find({
                state: EscrowState.WAITING_FOR_PAYMENT,
            });

            let funded = 0;
            let underpaid = 0;
            let failed = 0;

            for (const escrow of escrows) {
                try {
                    const { unlockedBalance } = await getSubaddressBalance(
                        escrow.depositAddressIndex
                    );

                    // Now checks against the escrow's actual expected
                    // amount (stored in atomic units at creation time)
                    // instead of funding on any nonzero payment. A
                    // partial/underpaid amount is left alone — it will
                    // keep being checked on future sweeps in case the
                    // buyer tops it up, but is not treated as funded.
                    if (unlockedBalance >= escrow.amount) {
                        await transitionEscrowInternal(
                            escrow._id.toString(),
                            Actor.WALLET,
                            EscrowState.FUNDED
                        );
                        funded++;
                    } else if (unlockedBalance > 0) {
                        underpaid++;
                        console.log(
                            `[EscrowPaymentJob] Escrow ${escrow._id} underpaid: received ${unlockedBalance}, expected ${escrow.amount}`
                        );
                    }
                } catch (err) {
                    failed++;
                    console.error(
                        `[EscrowPaymentJob] Failed to check/fund escrow ${escrow._id}:`,
                        err
                    );
                }
            }

            console.log(
                `[EscrowPaymentJob] Sweep complete. Checked=${escrows.length}, Funded=${funded}, Underpaid=${underpaid}, Failed=${failed}`
            );
        } catch (err) {
            console.error(
                "[EscrowPaymentJob] Sweep failed before processing escrows:",
                err
            );
        }
    });
}