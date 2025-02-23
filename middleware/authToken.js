const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const CustomError = require("../utils/CustomError");
const BlacklistedToken = require("../models/blacklistedTokenModel");

// Handle Refresh Token Logic
// const handleRefreshToken = async (req, res, next) => {
//   try {
//     const refreshToken = req.cookies?.refreshToken;

//     if (!refreshToken) {
//       return next(new CustomError("Session expired! Please log in again", 401));
//     }

//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     const user = await User.findById(decoded._id);

//     if (!user || user.refreshToken !== refreshToken) {
//       return next(new CustomError("Invalid refresh token", 403));
//     }

//     // Generate new access token
//     const accessToken = jwt.sign(
//       { _id: user._id },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
//     );

//     // Attach new access token to request
//     req.newAccessToken = accessToken;
//     req.user = user;
//     next(); // Continue to the next middleware
//   } catch (error) {
//     return next(new CustomError("Invalid refresh token", 401));
//   }
// };

// Authentication Middleware
module.exports.authToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return next(
        new CustomError("You are not logged in! Please login again", 401)
      );
    }

    //Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return next(new CustomError("Invalid or expired token", 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      // if (error instanceof jwt.TokenExpiredError) {
      //   return handleRefreshToken(req, res, next); // Call refresh logic and continue execution
      // }
      return next(new CustomError("Invalid token or token expired", 401));
    }

    // Fetch user from database
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      new CustomError(error?.message || "Authentication failed", 401)
    );
  }
};

// Middleware to check if user is an admin
module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new CustomError("You are not allowed to access as admin", 403));
  }
  next();
};
