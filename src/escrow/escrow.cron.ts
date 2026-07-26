import cron from "node-cron";
import Escrow from "./escrow.model";
import { EscrowState } from "./state";
import { Actor } from "./actor";
import { transitionEscrowInternal } from "./escrow.service";
import { getSubaddressBalance } from "./escrow.wallet.service";

export function startEscrowExpiryJob() {
    cron.schedule("*/5 * * * *", async () => {
        console.log("[EscrowExpiryJob] Starting payment timeout sweep...");
        try {
            const cutoff = new Date(Date.now() - 30 *60* 1000);
            const hardCutOff = new Date(Date.now() - 24*60*60*1000);
            const escrows = await Escrow.find({
                state: EscrowState.WAITING_FOR_PAYMENT,
                updatedAt: { $lte: cutoff },
            });

            let expired = 0;
            let skippedInFlight = 0;
            let failed = 0;
            let flaggedForReview = 0;

            for (const escrow of escrows) {
                try {
                    // Before expiring, check whether money has actually
                    // arrived on-chain but simply hasn't accumulated enough
                    // confirmations yet. A payment that's genuinely in
                    // flight (balance > 0) should never be auto-expired,
                    // even past the normal timeout — the buyer paid, we
                    // just haven't confirmed it yet. Let the payment cron
                    // handle it once it unlocks.
                    if(escrow.updatedAt <  hardCutOff){
                        const {balance} = await getSubaddressBalance(
                            escrow.depositAddressIndex
                        );
                        if(balance === 0 ){
                            await transitionEscrowInternal(
                                escrow._id.toString(),
                                Actor.SYSTEM,
                                EscrowState.EXPIRED
                            );
                            expired++;  
                        }else{
                            flaggedForReview++;
                            console.error(
                                `[EscrowExpiryJob] ATTENTION: escrow ${escrow._id} has an unresolved partial payment (${balance} atomic units) past the 24h ceiling - needs admin review`
                            );
                        }
                        continue;
                    }

                    const { balance } = await getSubaddressBalance(
                        escrow.depositAddressIndex
                    );

                    if (balance > 0) {
                        skippedInFlight++;
                        console.log(
                            `[EscrowExpiryJob] Skipping escrow ${escrow._id}: payment in flight (unconfirmed balance detected)`
                        );
                        continue;
                    }

                    await transitionEscrowInternal(
                        escrow._id.toString(),
                        Actor.SYSTEM,
                        EscrowState.EXPIRED
                    );
                    expired++;
                } catch (err) {
                    failed++;
                    console.error(
                        `[EscrowExpiryJob] Failed to process escrow ${escrow._id}:`,
                        err
                    );
                }
            }

            console.log(
                `[EscrowExpiryJob] Sweep complete. Found=${escrows.length}, Expired=${expired}, SkippedInFlight=${skippedInFlight}, Failed=${failed}, Flagged=${flaggedForReview}`
            );
        } catch (err) {
            console.error(
                "[EscrowExpiryJob] Sweep failed before processing escrows:",
                err
            );
        }
    });
}