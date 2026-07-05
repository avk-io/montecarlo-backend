const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  getListings,
  getListing,
  createListing,
  deleteListing
} = require("../controllers/listing.controller");

router.get("/", asyncHandler(getListings));
router.get("/:id", asyncHandler(getListing));
router.post("/", authMiddleware, asyncHandler(createListing));
router.delete("/:id", authMiddleware, asyncHandler(deleteListing));

module.exports = router;