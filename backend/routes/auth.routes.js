const express = require("express");
const authController = require("../controllers/auth.controller.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  next();
});

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes (authentication required)
router.post("/logout", authMiddleware, authController.logout);
router.get("/profile", authMiddleware, authController.getProfile);

// Token verification endpoint
router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
    message: "Token is valid",
  });
});

module.exports = router;
