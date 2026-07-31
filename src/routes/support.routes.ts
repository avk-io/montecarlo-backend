import { Router } from 'express';
import {createTicket,getMyTickets} from "../controllers/support.controller";
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.post("/",authMiddleware,createTicket);
router.get("/my-tickets",authMiddleware,getMyTickets);

export default router;