const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
// Debug logging
router.use((req, res, next) => {
  next();
});

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Create new user
router.post("/", userController.createUser);

// Update user
router.put("/:id", userController.updateUser);

// Delete user (soft delete)
router.delete("/:id", userController.deleteUser);

// Restore soft deleted user
router.patch("/:id/restore", userController.restoreUser);

// Change password
router.patch("/:id/password", userController.changePassword);

module.exports = router;
