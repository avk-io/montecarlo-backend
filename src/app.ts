import dotenv from "dotenv";
dotenv.config();

import express, {
    Request,
    Response,
    NextFunction,
} from "express";

import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db";

import authRoutes from "./routes/auth.routes";
import listingRoutes from "./routes/listing.routes";
import reviewRoutes from "./routes/review.routes";

import authMiddleware from "./middleware/auth.middleware";
import asyncHandler from "./utils/asyncHandler";

import User from "./models/user.model";

import { error } from "./utils/response";

const app = express();

connectDB();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests, try again later",
    },
});

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/listings", listingRoutes);

app.use("/api/v1/reviews", reviewRoutes);

app.get(
    "/api/v1/profile",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
        const user = await User.findById((req as any).userId);

        if (!user) {
            return error(res, 404, "User not found");
        }

        return res.json({
            success: true,
            data: {
                userId: user._id,
                username: user.username,
                elo: user.elo,
            },
        });
    })
);

app.use((req: Request, res: Response) => {
    return error(res, 404, "Route not found");
});

app.use(
    (
        err: any,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        console.error(err);

        return error(
            res,
            err.statusCode || 500,
            err.message || "Internal Server Error"
        );
    }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});