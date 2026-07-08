import { Router } from "express";

import {
    createReview,
    getReviewsForSeller,
    getReviewsByListing,
} from "../controllers/review.controller";

import auth from "../middleware/auth.middleware";

const router = Router();

router.post("/", auth, createReview);

router.get("/seller/:sellerId", getReviewsForSeller);

router.get("/listing/:listingId", getReviewsByListing);

export default router;