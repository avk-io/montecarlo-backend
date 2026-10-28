import mongoose, { Schema, Document } from 'mongoose';


interface IBid extends Document{
    auction: mongoose.Types.ObjectId;
    bidder: mongoose.Types.ObjectId;
    amount:  number;
}

const BidSchema = new Schema<IBid>({
    auction:{
        type:Schema.Types.ObjectId,
        ref:"Auction Listing",
        required:true
    },

    bidder:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    amount:{
        type:Number,
        required:true,
        min:0
    }
},{timestamps:true});

export default mongoose.model<IBid>("Biddings", BidSchema);