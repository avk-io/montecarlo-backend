import {Request,Response} from 'express';
import AuctionSchema from '../models/auction.model';
import {success,error} from '../utils/response';
import asyncHandler from '../utils/asyncHandler';
import BidSchema from "../models/bid.model";

interface AuthRequest extends Request{
    userId?:string;
}

export const createAuction = async(req:AuthRequest,res:Response)=>{
    try{
        const {title,description,category,startingPrice,image,endsAt} = req.body;
        if (!title || !description  || !category) {
        return error(res, 400, 'Missing required fields');
        }

        if (startingPrice == null) {
            return error(res, 400, "Missing required field");
        }

        if (typeof startingPrice !== "number") {
            return error(res, 400, "startingPrice must be a number");
        }
 
        if(startingPrice < 0){
            return error(res,400,"Price cannot be negative");
        }
        if (image && image.length > 5242880) {
        return error(res, 400, 'Image too large (max 5MB)');
        }

        const endTime = new Date(endsAt).getTime();

        if(Number.isNaN(endTime)){
            return error(res,400,"Invalid ending time");
        }

        if(endTime <= Date.now()){
            return error(res,400,"Auction must end in future");
        }

        const auctionListing = await AuctionSchema.create({
            title,
            description,
            category,
            startingPrice,
            seller: req.userId,
            image: image,
            currentPrice:startingPrice,
            endsAt
        });
        
        await auctionListing.populate('seller','username elo');
        return success(res,auctionListing);
    }catch(err:any){
        return error(res,500,err.message);
    }
};

export const getAuctions = (async(req:Request,res:Response)=>{
    const auctions = await AuctionSchema.find()
        .populate("seller","username elo")
        .sort({createdAt: -1});

    return success (res,auctions);
})

export const getAuction = (async(req:Request,res:Response)=>{
    const auction = await AuctionSchema.findById(req.params.id)
        .populate("seller","username elo");

    if(!auction){
        return error(res,404,"Auction not found");
    }

    return success(res,auction);
})

export const placeBid = (async (req: AuthRequest, res: Response) => {
    const auction = await AuctionSchema.findById(req.params.id);
    if (!auction) {
        return error(res, 404, "Auction not found");
    }

    if (auction.status === "ACTIVE" && new Date(auction.endsAt).getTime() <= Date.now()) {
        auction.status = "ENDED";
        await auction.save();
    }

    if (auction.status !== "ACTIVE") {
        return error(res, 409, "Auction has been ended");
    }

    const bidder = req.userId;
    if (!bidder) {
        return error(res, 401, "Unauthorized");
    }
    if (bidder === auction.seller.toString()) {
        return error(res, 403, "Sellers cannot bid on their own auctions");
    }

    const { amount } = req.body;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        return error(res, 400, "amount must be a positive number");
    }

    const updated = await AuctionSchema.findOneAndUpdate(
        {
            _id: auction._id,
            status: "ACTIVE",
            endsAt: { $gt: new Date() },
            currentPrice: { $lt: amount },
        },
        { $set: { currentPrice: amount } },
        { returnDocument: "after" }
    );

    if (!updated) {
        const fresh = await AuctionSchema.findById(auction._id);
        if (!fresh) return error(res, 404, "Auction not found");
        if (fresh.status !== "ACTIVE" || new Date(fresh.endsAt).getTime() <= Date.now()) {
            return error(res, 409, "Auction has been ended");
        }
        return error(res, 409, "Bid must be greater than current price");
    }

    const bid = await BidSchema.create({
        auction: updated._id,
        bidder,
        amount,
    });

    return success(res, bid);
})

export const getBids = (async (req: Request, res: Response) => {
    const bids = await BidSchema.find({ auction: req.params.id })
        .populate("bidder", "username")
        .sort({ createdAt: -1 });

    return success(res, bids);
})