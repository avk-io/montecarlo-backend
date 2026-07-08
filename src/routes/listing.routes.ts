import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import asyncHandler from "../utils/asyncHandler";

import {
    getListings,
    getListing,
    createListing,
    deleteListing,
} from "../controllers/listing.controller";

const router = Router();

router.get("/", asyncHandler(getListings));

router.get("/:id", asyncHandler(getListing));

router.post(
    "/",
    authMiddleware,
    asyncHandler(createListing)
);

router.delete(
    "/:id",
    authMiddleware,
    asyncHandler(deleteListing)
);

export default router;