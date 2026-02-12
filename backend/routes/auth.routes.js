const express = require("express");
const authController = require("../controllers/auth.controller.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.use((req, res, next) => {
  next();
});

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.post("/logout", authMiddleware, authController.logout);
router.get("/profile", authMiddleware, authController.getProfile);
router.patch("/profile", authMiddleware, authController.updateProfile);
router.patch("/password", authMiddleware, authController.changePassword);

router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
    message: "Token is valid",
  });
});

module.exports = router;
