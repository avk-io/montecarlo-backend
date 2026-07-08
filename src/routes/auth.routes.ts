import { Router } from "express";
import rateLimit from "express-rate-limit";

import validate from "../middleware/validate";
import { signupSchema, loginSchema } from "../validators/auth.validator";
import { signup, login, refresh, logout } from "../controllers/auth.controller";
import asyncHandler from "../utils/asyncHandler";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many login attempts",
    },
});

router.post(
    "/signup",
    validate(signupSchema),
    asyncHandler(signup)
);

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    asyncHandler(login)
);

router.post(
    "/refresh",
    asyncHandler(refresh)
);

router.post(
    "/logout",
    asyncHandler(logout)
);

export default router;