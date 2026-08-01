import cron from "node-cron";
import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import { Actor } from "./actor";
import { transitionEscrowInternal } from "./escrow.service";

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
            let failed = 0;

            for (const escrow of escrows) {
                try {
                    await transitionEscrowInternal(
                        escrow._id.toString(),
                        Actor.SYSTEM,
                        EscrowState.RELEASED
                    );
                    released++;
                } catch (err) {
                    failed++;
                    console.error(
                        `[EscrowReleaseJob] Failed to release escrow ${escrow._id}:`,
                        err
                    );
                }
            }

            console.log(
                `[EscrowReleaseJob] Sweep complete. Checked=${escrows.length}, Released=${released}, Failed=${failed}`
            );
        } catch (err) {
            console.error(
                "[EscrowReleaseJob] Sweep failed before processing escrows:",
                err
            );
        }
    });
}