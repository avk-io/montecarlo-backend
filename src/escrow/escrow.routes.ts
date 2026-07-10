import { Router } from "express";
import { createEscrowController, transitionEscrowController } from "./escrow.controller";
import authMiddleware from "../middleware/auth.middleware";

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

export default router;