import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

const envSchema = z.object({
    MONGO_URI: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(12),
    REFRESH_TOKEN_SECRET: z.string().min(12),
    CLIENT_URL: z.string().url().default("http://localhost:3000"),
    PORT: z.coerce.number().int().positive().default(3000),
    INTERNAL_API_KEY: z.string().min(12),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONERO_RPC_URL: z.string().url().default("http://127.0.0.1:38083/json_rpc"),
    MONERO_RPC_USERNAME: z.string().optional(),
    MONERO_RPC_PASSWORD: z.string().optional(),
    CORS_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;

export function corsOrigins(): string[] {
    if (env.CORS_ORIGINS) {
        return env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [env.CLIENT_URL];
}
