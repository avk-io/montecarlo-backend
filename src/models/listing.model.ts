import mongoose, { Schema, Document } from 'mongoose';

interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  seller: mongoose.Types.ObjectId;
  image: string; // single image, base64
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  image: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model<IListing>("Listing", listingSchema);