import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Listing from '../models/listing.model';
import User from '../models/user.model';
import { success, error } from '../utils/response';

interface AuthRequest extends Request {
  userId?: string;
}

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

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, category, image } = req.body;

    if (!title || !description || !price || !category) {
      return error(res, 400, 'Missing required fields');
    }

    // Validate image if provided (max 5MB)
    if (image && image.length > 5242880) {
      return error(res, 400, 'Image too large (max 5MB)');
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      seller: req.userId,
      image: image || null
    });

    await listing.populate('seller', 'username elo');
    return success(res, listing);
  } catch (err: any) {
    return error(res, 500, err.message);
  }
};
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