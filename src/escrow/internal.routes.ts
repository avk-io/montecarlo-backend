import { Router } from "express";
import internalAuthMiddleware from "../middleware/internal-auth.middleware";
import { systemTransitionController,walletTransitionController } from "./escrow.controller";

const router = Router();

router.patch(
    "/:id/transition/system",
    internalAuthMiddleware,
    systemTransitionController
);

router.patch(
    "/:id/transition/wallet",
    internalAuthMiddleware,
    walletTransitionController
);

export default router;

