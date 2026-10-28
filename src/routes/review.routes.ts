import { Router } from "express";

import {
    createReview,
    getReviewsForSeller,
    getReviewsByListing,
} from "../controllers/review.controller";

import auth from "../middleware/auth.middleware";
import validate from "../middleware/validate";
import { createReviewSchema } from "../validators/review.validator";

const router = Router();

router.post("/", auth, validate(createReviewSchema), createReview);

router.get("/seller/:sellerId", getReviewsForSeller);

router.get("/listing/:listingId", getReviewsByListing);

export default router;