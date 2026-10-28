import {Router} from "express";

import authMiddleware from '../middleware/auth.middleware';
import asyncHandler from '../utils/asyncHandler';
import validate from '../middleware/validate';
import { createAuctionSchema, placeBidSchema } from '../validators/auction.validator';

import {
    createAuction,
    getAuctions,
    getAuction,
    placeBid,
    getBids
} from "../controllers/auction.controller";

const router = Router();
router.post("/",authMiddleware,validate(createAuctionSchema),asyncHandler(createAuction));
router.get("/",asyncHandler(getAuctions));
router.get("/:id",asyncHandler(getAuction));
router.post("/:id/bids",authMiddleware,validate(placeBidSchema),asyncHandler(placeBid));
router.get("/:id/bids",asyncHandler(getBids));
export default router;