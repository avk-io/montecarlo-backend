import { Router } from "express";
import { createEscrowController, transitionEscrowController } from "./escrow.controller";
import authMiddleware from "../middleware/auth.middleware";
import isAdminMiddleware from "../middleware/isAdmin.middleware";
import {triggerPayout} from "./escrow.payout.controller";
import {getMyEscrowsController} from "./escrow.controller"
const router = Router();

router.post(
    "/",
    authMiddleware,
    createEscrowController
);

router.patch(
    "/:id/transition",
    authMiddleware,
    transitionEscrowController
);

router.post(
    "/:id/payout",
    authMiddleware,
    isAdminMiddleware,
    triggerPayout
);

router.get(
    "/mine",
    authMiddleware,
    getMyEscrowsController,
)
export default router;