import { Router } from 'express';
import {createTicket,getMyTickets} from "../controllers/support.controller";
import authMiddleware from '../middleware/auth.middleware';
import validate from '../middleware/validate';
import { createTicketSchema } from '../validators/support.validator';

const router = Router();

router.post("/",authMiddleware,validate(createTicketSchema),createTicket);
router.get("/my-tickets",authMiddleware,getMyTickets);

export default router;