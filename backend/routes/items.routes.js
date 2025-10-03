const express = require("express");
const router = express.Router();
const itemController = require("../controllers/items.controller");
const { upload } = require("../middleware/auth.middleware");

// Debug logging
router.use((req, res, next) => {
  console.log(`[Items Router] ${req.method} ${req.path}`);
  next();
});

// Get all items
router.get("/", itemController.getAllItems);

// Get item by ID
router.get("/:id", itemController.getItemById);

// Create new item (with image upload)
router.post("/", upload.single("image"), itemController.createItem);

// Update item
router.put("/:id", upload.single("image"), itemController.updateItem);

// Delete item (soft delete)
router.delete("/:id", itemController.deleteItem);

// Restore soft deleted item
router.patch("/:id/restore", itemController.restoreItem);

module.exports = router;
