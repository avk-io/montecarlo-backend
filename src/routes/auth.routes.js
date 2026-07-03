const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../validators/auth.validator");

const { signup, login, refresh, logout } = require("../controllers/auth.controller");
const asyncHandler = require("../utils/asyncHandler");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts" }
});

router.post("/signup", validate(signupSchema), asyncHandler(signup));
router.post("/login", loginLimiter, validate(loginSchema), asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

module.exports = router;