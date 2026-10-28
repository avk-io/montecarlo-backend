import { Router } from "express";
import internalAuthMiddleware from "../middleware/internal-auth.middleware";
import validate from "../middleware/validate";
import { transitionEscrowSchema } from "../validators/escrow.validator";
import { systemTransitionController,walletTransitionController } from "./escrow.controller";

const router = Router();

router.patch(
    "/:id/transition/system",
    internalAuthMiddleware,
    validate(transitionEscrowSchema),
    systemTransitionController
);

router.patch(
    "/:id/transition/wallet",
    internalAuthMiddleware,
    validate(transitionEscrowSchema),
    walletTransitionController
);

export default router;

