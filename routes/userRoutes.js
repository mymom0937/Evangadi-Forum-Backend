const express = require("express");
const router = express.Router();

//  authentication middleware
const authMiddleware = require("../middleware/authMiddleware.js");

//  User Controller
const {
  register,
  login,
  checkUser,
  resetPassword,
} = require("../controller/userController.js");
// Register routes
router.post("/register", register);

// Login User
router.post("/login", login);

// Check User
router.get("/check", authMiddleware, checkUser);

// Reset Password
router.post("/password-reset", resetPassword);

module.exports = router;
