import { Schema, model, Types, Document } from "mongoose";

export interface IListing extends Document {
    title: string;
    description: string;
    price: number;
    category: string;
    seller: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Listing = model<IListing>("Listing", listingSchema);

export default Listing;