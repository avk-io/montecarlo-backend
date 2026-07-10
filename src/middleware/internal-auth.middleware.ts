import { Request, Response, NextFunction } from "express";

import { error } from "../utils/response";

const internalAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const providedKey = req.headers["x-internal-key"];

    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey) {
        console.error(
            "INTERNAL_API_KEY is not set in the environment"
        );
        return error(res, 500, "Internal auth misconfigured");
    }

    if (!providedKey || providedKey !== expectedKey) {
        return error(res, 401, "Invalid internal key");
    }

    next();
};

export default internalAuthMiddleware;