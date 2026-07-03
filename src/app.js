require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");

const authMiddleware = require("./middleware/auth.middleware");
const asyncHandler = require("./utils/asyncHandler");

const User = require("./models/user.model");

const { error } = require("./utils/response");

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
});

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/auth", authRoutes);

app.get(
  "/api/v1/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
      return error(res, 404, "User not found");
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
      },
    });
  })
);

app.use((req, res) => {
    return error(res, 404, "Route not found");
});

app.use((err, req, res, next) => {
    console.error(err);
    return error(
        res,
        err.statusCode || 500,
        err.message || "Internal Server Error"
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});