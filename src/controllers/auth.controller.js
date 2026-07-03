const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('node:crypto')
const User = require('../models/user.model')

const {success,error} = require('../utils/response')
const asyncHandler = require('../utils/asyncHandler')

exports.signup = asyncHandler(async (req,res)=>{
    const {username,password} = req.body;

    const existingUser = await User.findOne({username});
    if(existingUser)
        return error(res,400,"Username is taken !");

    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
        username,
        password:hashedPassword,
    })
    return success(res,{
        userId:user._id
    });
})

exports.login = asyncHandler(async (req,res)=>{
    const {username,password}  = req.body;

    const user = await User.findOne({username});
    if(!user)
        return error(res,404,"User not found");

    const isLegit = await bcrypt.compare(password,user.password);
    if(!isLegit)
        return error(res,401,"Invalid Credentials")

    const accessToken = jwt.sign(
        {userId:user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"15m"}
    );
    const refreshToken = jwt.sign(
    {    userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "168h" }
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshTokenHash = refreshTokenHash;

  user.refreshMeta = {
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  };

  await user.save();

 res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

  return success(res, { accessToken });
})

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return error(res, 401, "Missing Refresh Token");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    return error(res, 401, "Invalid/Expired refresh token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return error(res, 404, "User not found");
  }

  //  Session binding check
  if (
    user.refreshMeta?.ip !== req.ip ||
    user.refreshMeta?.userAgent !== req.headers["user-agent"]
  ) {
    return error(res, 401, "Suspicious session detected");
  }

  const incomingHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  if (incomingHash !== user.refreshTokenHash) {
    return error(res, 401, "Refresh Token mismatch");
  }

  // Rotate refresh token
  const newRefreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "168h" }
  );

  const newHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshTokenHash = newHash;

  // Update session meta
  user.refreshMeta = {
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  };

  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return success(res, { accessToken });
});

//  LOGOUT 
exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return success(res, { msg: "Logged Out" });
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    return success(res, { msg: "Logged Out" });
  }

  const user = await User.findById(decoded.userId);

  if (user) {
    user.refreshTokenHash = null;
    user.refreshMeta = null;
    await user.save();
  }

 res.clearCookie("refreshToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
});

  return success(res, { msg: "Logged Out" });
});