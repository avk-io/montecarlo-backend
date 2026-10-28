import { Router } from "express";

import { updatePayoutAddress } from "../controllers/user.controller";
import authMiddleware from "../middleware/auth.middleware";
import validate from "../middleware/validate";
import { updatePayoutAddressSchema } from "../validators/user.validator";

const router = Router();

router.patch(
    "/me/payout-address",
    authMiddleware,
    validate(updatePayoutAddressSchema),
    updatePayoutAddress
);

export default router;