import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { env } from "../config/env";
import { error } from "../utils/response";

const internalAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const providedKey = req.headers["x-internal-key"];

    if (typeof providedKey !== "string") {
        return error(res, 401, "Invalid internal key");
    }

    const expected = Buffer.from(env.INTERNAL_API_KEY);
    const provided = Buffer.from(providedKey);

    if (
        expected.length !== provided.length ||
        !crypto.timingSafeEqual(expected, provided)
    ) {
        return error(res, 401, "Invalid internal key");
    }

    next();
};

export default internalAuthMiddleware;
