import { z } from "zod";

export const updatePayoutAddressSchema = z.object({
    payoutAddress: z.string().min(1),
});
