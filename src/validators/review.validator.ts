import { z } from "zod";

export const createReviewSchema = z.object({
    seller: z.string().min(1),
    listing: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(""),
});
