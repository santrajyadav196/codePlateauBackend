const BlacklistedToken = require("../models/blacklistedTokenModel");
const User = require("../models/userModel");
const cookieOptions = require("../utils/cookieOptions");
const CustomError = require("../utils/CustomError");
const jwt = require("jsonwebtoken");

// Generate tokens and save refreshToken to DB
const generateAccessAndRefreshTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

// Register User
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    if (await User.findOne({ email })) {
      return next(new CustomError("Email already exists", 409));
    }

    const user = await User.create({ name, email, password, phone });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user
    );

    return res.status(201).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          _id: user._id,
        },
        accessToken,
        refreshToken,
      },
      // data: {
      //   name: user.name,
      //   email: user.email,
      //   phone: user.phone,
      //   _id: user._id,
      // },
      // accessToken,
      // refreshToken,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshToken"
    );

    if (!user) return next(new CustomError("Invalid email or password!", 401));

    if (!(await user.isPasswordCorrect(password))) {
      return next(new CustomError("Invalid email or password!", 401));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user
    );

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        accessToken,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Refresh Access Token
exports.refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingRefreshToken } = req.cookies;

    if (!incomingRefreshToken)
      return next(new CustomError("Unauthorized", 401));

    let decodedToken;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return next(new CustomError("Invalid or expired refresh token", 401));
    }

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user || incomingRefreshToken !== user.refreshToken) {
      return next(new CustomError("Refresh token is expired or used", 401));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user
    );

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      accessToken,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Logout User
exports.logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!refreshToken) return next(new CustomError("Unauthorized", 401));

    let decodedToken;
    try {
      decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return next(new CustomError("Invalid or expired refresh token", 401));
    }

    const user = await User.findById(decodedToken?._id);
    if (user) {
      await user.updateOne({ refreshToken: null });
    }

    // Blacklist the access token
    if (accessToken) {
      await BlacklistedToken.create({
        token: accessToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Assuming 15-min token expiry
      });
    }

    res.clearCookie("refreshToken", { path: "/" });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// fetch user profile
exports.userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    console.log(role);

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { role },
      { new: true, select: "-password -refreshToken" } // Moved select inside options
    );

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.fetchUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name email phone role createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully!",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
