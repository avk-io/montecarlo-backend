import { z } from "zod";
import { EscrowState } from "../escrow/state";

export const createEscrowSchema = z.object({
    listingId: z.string().min(1),
    sellerId: z.string().min(1),
    amount: z.number().finite().positive(),
});

export const transitionEscrowSchema = z.object({
    nextState: z.enum(Object.values(EscrowState) as [string, ...string[]]),
});
