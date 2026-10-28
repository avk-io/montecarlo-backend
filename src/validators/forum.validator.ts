import { z } from "zod";

export const createThreadSchema = z.object({
    title: z.string().min(1).max(200).trim(),
    content: z.string().min(1).max(10000).trim(),
});

export const createReplySchema = z.object({
    content: z.string().min(1).max(10000).trim(),
});
