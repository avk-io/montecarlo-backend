import { Request, Response, NextFunction } from "express";

import User from "../models/user.model";
import { error } from "../utils/response";

const isAdminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = (req as any).userId;

    const user = await User.findById(userId);

    if (!user?.isAdmin) {
        return error(res, 403, "Admin access required");
    }

    next();
};

export default isAdminMiddleware;