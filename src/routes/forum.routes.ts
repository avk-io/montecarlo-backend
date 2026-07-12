import { Router } from 'express';
import { getThreads, getThread, createThread, createReply } from '../controllers/forum.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/', getThreads);
router.get('/:id', getThread);
router.post('/', authMiddleware, createThread);
router.post('/:threadId/replies', authMiddleware, createReply);

export default router;