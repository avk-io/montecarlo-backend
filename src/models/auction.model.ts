import mongoose , {Schema,Document} from 'mongoose';
import {AuctionState} from '../auction/state';
interface IAuction extends Document{
    title:string;
    description:string;
    startingPrice:number;
    currentPrice:number;
    status:string;
    image:string | null;
    category:string;
    seller:mongoose.Types.ObjectId;
    endsAt:Date;
}

const AuctionSchema = new Schema<IAuction>({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    startingPrice:{
        type:Number,
        required:true,
        min:0
    },
    category:{
        type:String,
        required:true
    },
    currentPrice:{
        type:Number,
        required:true,
        min:0
    },
    seller:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    image:{
        type:String,
        default:null
    },
    status:{
        type:String,
        enum:Object.values(AuctionState),
        default:AuctionState.ACTIVE
    },
    endsAt:{
        type:Date,
        required:true
    }
},{timestamps:true});

export default mongoose.model<IAuction>("Auction Listing",AuctionSchema);


