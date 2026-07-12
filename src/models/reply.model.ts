import mongoose, { Schema, Document } from 'mongoose';

interface IReply extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  thread: mongoose.Types.ObjectId;
  createdAt: Date;
}

const replySchema = new Schema<IReply>({
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
  thread: {
    type: Schema.Types.ObjectId,
    ref: "Thread",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model<IReply>("Reply", replySchema);