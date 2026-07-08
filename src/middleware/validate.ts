import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

import { error } from "../utils/response";

const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return error(
                res,
                422,
                result.error.issues[0].message
            );
        }

        req.body = result.data;

        next();
    };

export default validate;