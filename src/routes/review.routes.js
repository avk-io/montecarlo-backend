const express = require("express");
const router = express.Router();

const {
    createReview,
    getReviewsForSeller,
    getReviewsByListing
} = require("../controllers/review.controller");

const auth = require("../middleware/auth.middleware");

router.post("/", auth, createReview);

router.get("/seller/:sellerId", getReviewsForSeller);

router.get("/listing/:listingId", getReviewsByListing);

module.exports = router;