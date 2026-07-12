import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Thread from '../models/thread.model';
import Reply from '../models/reply.model';
import { success, error } from '../utils/response';

interface AuthRequest extends Request {
  userId?: string;
}

export const getThreads = async (req: AuthRequest, res: Response) => {
  try {
    const threads = await Thread.find()
      .populate('author', 'username')
      .sort({ lastActivity: -1 });

    return success(res, threads);
  } catch (err: any) {
    return error(res, 500, err.message);
  }
};

export const getThread = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const threadId = new mongoose.Types.ObjectId(id);
    const thread = await Thread.findById(threadId).populate('author', 'username');

    if (!thread) {
      return error(res, 404, 'Thread not found');
    }

    const replies = await Reply.find({ thread: threadId })
      .populate('author', 'username')
      .sort({ createdAt: 1 });

    return success(res, { thread, replies });
  } catch (err: any) {
    return error(res, 500, err.message);
  }
};

export const createThread = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return error(res, 400, 'Title and content required');
    }

    const thread = await Thread.create({
      title,
      content,
      author: req.userId
    });

    await thread.populate('author', 'username');
    return success(res, thread);
  } catch (err: any) {
    return error(res, 500, err.message);
  }
};

export const createReply = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const threadIdParam = Array.isArray(req.params.threadId) ? req.params.threadId[0] : req.params.threadId;
    const threadId = new mongoose.Types.ObjectId(threadIdParam);

    if (!content) {
      return error(res, 400, 'Content required');
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return error(res, 404, 'Thread not found');
    }

    const reply = await Reply.create({
      content,
      author: req.userId,
      thread: threadId
    });

    await reply.populate('author', 'username');

    thread.replies += 1;
    thread.lastActivity = new Date();
    await thread.save();

    return success(res, reply);
  } catch (err: any) {
    return error(res, 500, err.message);
  }
};