import { z } from "zod";

export const signupSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(20)
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username should only contain letters, numbers and underscores"
        ),

    password: z.string().min(8),
});

export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;