import { z } from "zod";

export const createListingSchema = z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().min(1).max(5000).trim(),
    price: z.number().finite().nonnegative(),
    category: z.string().min(1).max(100).trim(),
    image: z.string().max(5242880).optional().nullable(),
});
