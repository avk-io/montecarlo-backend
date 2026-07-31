import mongoose,{ Schema, Document } from "mongoose";

export interface ISupportTicket extends Document{
    title:string;
    description:string;

    category:
        | "payment"
        | "order"
        | "listing"
        | "account"
        | "forum"
        | "scam"
        | "other";

    status:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed";
    
    userId: mongoose.Types.ObjectId;

    orderId?: mongoose.Types.ObjectId;
    listingId?: mongoose.Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
    {
        title:{
            type:String,
            required:true,
            trim:true,
            maxlength: 150,
        },

        description:{
            type:String,
            required:true,
            trim:true,
            maxlength:5000,
        },

        category: {
            type: String,
            enum: [
                "payment",
                "order",
                "listing",
                "account",
                "forum",
                "scam",
                "other",
            ],
            required:true,
        },

        status:{
            type:String,
            enum:[
                "open",
                "in_progress",
                "resolved",
                "closed",
            ],
            default: "open"
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },

        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Escrow",
        },

        listingId:{
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ISupportTicket>(
    "SupportTicket",
    supportTicketSchema
);