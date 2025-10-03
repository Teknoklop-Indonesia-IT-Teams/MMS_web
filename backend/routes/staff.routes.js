const express = require("express");
const staffController = require("../controllers/staff.controller.js");
// const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

// Apply auth middleware to all routes (disabled for testing)
// router.use(authMiddleware); // Keep commented for now - will enable after testing

router.get("/", staffController.getAllStaff);
router.get("/:id", staffController.getStaffById);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);

module.exports = router;
