const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  userProfile,
  updateUserRole,
  fetchUsers,
} = require("../controllers/userController");
const { authToken, isAdmin } = require("../middleware/authToken");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authToken, logoutUser);
router.get("/profile", authToken, userProfile);
router.put("/update-role", authToken, updateUserRole);
router.get("/users", authToken, isAdmin, fetchUsers);

module.exports = router;
