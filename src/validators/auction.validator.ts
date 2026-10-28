import { z } from "zod";

export const createAuctionSchema = z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().min(1).max(5000).trim(),
    category: z.string().min(1).max(100).trim(),
    startingPrice: z.number().finite().nonnegative(),
    image: z.string().max(5242880).optional().nullable(),
    endsAt: z.string().min(1),
});

export const placeBidSchema = z.object({
    amount: z.number().finite().positive(),
});
