import { Response } from "express";

export function success(res: Response, data: unknown) {
    return res.status(200).json({
        success: true,
        data,
    });
}

export function error(
    res: Response,
    code: number,
    message: string
) {
    return res.status(code).json({
        success: false,
        message,
    });
}