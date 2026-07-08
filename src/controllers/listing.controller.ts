import { Request, Response } from "express";

import User from "../models/user.model";
import Listing from "../models/listing.model";

import { success, error } from "../utils/response";
import asyncHandler from "../utils/asyncHandler";

export const getListings = (
    async (req: Request, res: Response) => {
        const listings = await Listing.find()
            .populate("seller", "username elo")
            .sort({ createdAt: -1 });

        return success(res, listings);
    }
);

export const getListing = (
    async (req: Request, res: Response) => {
        const listing = await Listing.findById(req.params.id)
            .populate("seller", "username elo");

        if (!listing) {
            return error(res, 404, "Listing not found");
        }

        return success(res, listing);
    }
);

export const createListing = (
    async (req: Request, res: Response) => {
        const user = await User.findById((req as any).userId);

        if (!user) {
            return error(res, 404, "User not found");
        }

        const { title, description, price, category } = req.body;

        const listing = await Listing.create({
            title,
            description,
            price,
            category,
            seller: (req as any).userId,
        });

        return success(res, listing);
    }
);

export const deleteListing = (
    async (req: Request, res: Response) => {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return error(res, 404, "Listing not found");
        }

        if (listing.seller.toString() !== (req as any).userId) {
            return error(res, 403, "Not authorized");
        }

        await listing.deleteOne();

        return success(res, {
            msg: "Listing deleted",
        });
    }
);