import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { error } from "../utils/response";
import { env } from "../config/env";

const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return error(res, 401, "No Token");
    }

    const accessToken = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            accessToken,
            env.ACCESS_TOKEN_SECRET
        ) as JwtPayload & {
            userId: string;
        };

        req.user = decoded;
        (req as any).userId = decoded.userId;

        next();
    } catch {
        return error(res, 403, "Invalid Token");
    }
};

export default authMiddleware;