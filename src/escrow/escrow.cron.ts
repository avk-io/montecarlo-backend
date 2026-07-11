import cron from "node-cron";
import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import { Actor } from "./actor";
import { transitionEscrowInternal } from "./escrow.service";

export function startEscrowExpiryJob() {
    cron.schedule("*/5 * * * *", async () => {
        console.log("[EscrowExpiryJob] Starting payment timeout sweep...");

        try {
            // 30 minutes ago
            const cutoff = new Date(Date.now() - 30 * 60 * 1000);

            const escrows = await Escrow.find({
                state: EscrowState.WAITING_FOR_PAYMENT,
                updatedAt: { $lte: cutoff },
            });

            let succeeded = 0;
            let failed = 0;

            for (const escrow of escrows) {
                try {
                    await transitionEscrowInternal(
                        escrow._id.toString(),
                        Actor.SYSTEM,
                        EscrowState.EXPIRED
                    );

                    succeeded++;
                } catch (err) {
                    failed++;

                    console.error(
                        `[EscrowExpiryJob] Failed to expire escrow ${escrow._id}:`,
                        err
                    );
                }
            }

            console.log(
                `[EscrowExpiryJob] Sweep complete. Found=${escrows.length}, Expired=${succeeded}, Failed=${failed}`
            );
        } catch (err) {
            console.error(
                "[EscrowExpiryJob] Sweep failed before processing escrows:",
                err
            );
        }
    });
}