const User = require("../models/user.model");
const Listing = require("../models/listing.model");
const { success, error } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

exports.getListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .populate("seller", "username elo")
    .sort({ createdAt: -1 });

  return success(res, listings);
});

exports.getListing = asyncHandler(async(req,res)=>{
    const listing = await Listing.findById(req.params.id)
        .populate("seller","username elo");

    if(!listing){
        return error(res,404,"Listing not found");
    }

    return success(res,listing);
});

exports.createListing = asyncHandler(async(req,res)=>{
  const user  = await User.findById(req.userId);

  const {title,description,price,category} = req.body;

  const listing = await Listing.create({
    title,
    description,
    price,
    category,
    seller: req.userId
  });

  return success(res, listing);
});

exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return error(res, 404, "Listing not found");
  }

  if (listing.seller.toString() !== req.userId) {
    return error(res, 403, "Not authorized");
  }

  await listing.deleteOne();
  return success(res, { msg: "Listing deleted" });
});