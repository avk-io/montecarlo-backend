import { Schema, model, Types, Document } from "mongoose";

export interface IReview extends Document {
    reviewer: Types.ObjectId;
    seller: Types.ObjectId;
    listing: Types.ObjectId;

    rating: number;
    comment: string;

    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// One review per (reviewer, seller, listing)
reviewSchema.index(
    { reviewer: 1, seller: 1, listing: 1 },
    { unique: true }
);

const Review = model<IReview>("Review", reviewSchema);

export default Review;