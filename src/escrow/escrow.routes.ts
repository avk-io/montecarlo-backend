import { Router } from "express";
import { createEscrowController, transitionEscrowController, getMyEscrowsController, getEscrowController, getFlaggedEscrowsController } from "./escrow.controller";
import authMiddleware from "../middleware/auth.middleware";
import isAdminMiddleware from "../middleware/isAdmin.middleware";
import { triggerPayout } from "./escrow.payout.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createEscrowController
);

router.get(
  "/mine",
  authMiddleware,
  getMyEscrowsController
);

router.get(
  "/:id",
  authMiddleware,
  getEscrowController
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
    "/admin/flagged",
    authMiddleware,
    isAdminMiddleware,
    getFlaggedEscrowsController
);

export default router;