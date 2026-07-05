const Review = require("../models/review.model");
const { success, error } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");
const {calcEloChange} = require("../utils/elo");
const User = require("../models/user.model");

exports.createReview = asyncHandler(async (req, res) => {
    const { seller, listing, rating, comment } = req.body;

    const existingReview = await Review.findOne({
        reviewer: req.userId,
        seller,
        listing
    });

    if (existingReview) {
        return error(res, 400, "You have already reviewed this listing");
    }

    const review = await Review.create({
        reviewer: req.userId,
        seller,
        listing,
        rating,
        comment
    });

    const reviewer = await User.findById(req.userId);
    const sellerUser = await User.findById(seller);

    if(!reviewer || !sellerUser){
        return error(res,404,"User not found");
    }

    if(rating >= 4){
        const change = calcEloChange(sellerUser.elo,reviewer.elo);
        sellerUser.elo += change;
    }else if(rating<=2){
        const change = calcEloChange(sellerUser.elo,reviewer.elo);
        sellerUser.elo -= change;
    }

    sellerUser.elo = Math.max(0,sellerUser.elo);

    await sellerUser.save();

    return success(res, review);
});

exports.getReviewsForSeller = asyncHandler(async (req, res) => {
    const reviews = await Review.find({
        seller: req.params.sellerId
    })
        .populate("reviewer", "username")
        .populate("listing", "title");

    return success(res, reviews);
});

exports.getReviewsByListing = asyncHandler(async (req, res) => {
    const reviews = await Review.find({
        listing: req.params.listingId
    })
        .populate("reviewer", "username")
        .populate("seller", "username");

    return success(res, reviews);
});