import mongoose, { Schema, Document } from 'mongoose';

interface IThread extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  replies: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const threadSchema = new Schema<IThread>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  replies: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
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

export default mongoose.model<IThread>("Thread", threadSchema);