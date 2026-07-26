import { Router } from "express";

import { updatePayoutAddress } from "../controllers/user.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.patch(
    "/me/payout-address",
    authMiddleware,
    updatePayoutAddress
);

export default router;