import { Request, Response } from "express";

import Review from "../models/review.model";
import User from "../models/user.model";

import { success, error } from "../utils/response";
import asyncHandler from "../utils/asyncHandler";
import { calcEloChange } from "../utils/elo";

export const createReview = asyncHandler(
    async (req: Request, res: Response) => {
        const { seller, listing, rating, comment } = req.body;

        const existingReview = await Review.findOne({
            reviewer: (req as any).userId,
            seller,
            listing,
        });

        if (existingReview) {
            return error(
                res,
                400,
                "You have already reviewed this listing"
            );
        }

        const review = await Review.create({
            reviewer: (req as any).userId,
            seller,
            listing,
            rating,
            comment,
        });

        const reviewer = await User.findById(
            (req as any).userId
        );

        const sellerUser = await User.findById(seller);

        if (!reviewer || !sellerUser) {
            return error(res, 404, "User not found");
        }

        if (rating >= 4) {
            const change = calcEloChange(
                sellerUser.elo,
                reviewer.elo
            );

            sellerUser.elo += change;
        } else if (rating <= 2) {
            const change = calcEloChange(
                sellerUser.elo,
                reviewer.elo
            );

            sellerUser.elo -= change;
        }

        sellerUser.elo = Math.max(
            0,
            sellerUser.elo
        );

        await sellerUser.save();

        return success(res, review);
    }
);

export const getReviewsForSeller = asyncHandler(
    async (req: Request, res: Response) => {
        const reviews = await Review.find({
            seller: req.params.sellerId,
        })
            .populate("reviewer", "username")
            .populate("listing", "title");

        return success(res, reviews);
    }
);

export const getReviewsByListing = asyncHandler(
    async (req: Request, res: Response) => {
        const reviews = await Review.find({
            listing: req.params.listingId,
        })
            .populate("reviewer", "username")
            .populate("seller", "username");

        return success(res, reviews);
    }
);