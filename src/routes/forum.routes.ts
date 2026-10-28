import { Router } from 'express';
import { getThreads, getThread, createThread, createReply,deleteReply,deleteThread } from '../controllers/forum.controller';
import authMiddleware from '../middleware/auth.middleware';
import validate from '../middleware/validate';
import { createThreadSchema, createReplySchema } from '../validators/forum.validator';

const router = Router();

router.get('/', getThreads);
router.get('/:id', getThread);
router.post('/', authMiddleware, validate(createThreadSchema), createThread);
router.post('/:threadId/replies', authMiddleware, validate(createReplySchema), createReply);
router.delete('/:id', authMiddleware, deleteThread);
router.delete('/:threadId/replies/:replyId', authMiddleware, deleteReply);

export default router;