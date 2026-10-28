import { z } from "zod";

export const createTicketSchema = z.object({
    title: z.string().min(1).max(150).trim(),
    description: z.string().min(1).max(5000).trim(),
    category: z.enum(["payment","order","listing","account","forum","scam","other"]),
    orderId: z.string().optional(),
    listingId: z.string().optional(),
});
