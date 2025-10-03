const express = require("express");
const alatController = require("../controllers/alat.controller.js");
const upload = require("../middleware/upload.js");
const autoHeicConverter = require("../middleware/heicConverter.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

// Add debug middleware
router.use((req, res, next) => {
  console.log(`[Alat Router] ${req.method} ${req.path}`);
  next();
});

// Apply auth middleware to protected routes only (skip for GET all equipment)
router.get("/", alatController.getAllAlat); // Public route for testing
router.get("/test-maintenance", alatController.testMaintenance); // Public route
router.get("/public/:id", alatController.getPublicAlatById); // Public route for QR code access

// Protected routes
router.use(authMiddleware); // Apply auth middleware after public routes

router.get("/:id", alatController.getAlatById);
router.post(
  "/",
  upload.single("gambar"),
  autoHeicConverter,
  alatController.createAlat
);
router.put(
  "/:id",
  upload.single("gambar"),
  autoHeicConverter,
  alatController.updateAlat
);
router.delete("/:id", alatController.deleteAlat);

// Maintenance routes
router.post("/:id/stop-maintenance", alatController.stopMaintenance);
router.post("/:id/complete-maintenance", alatController.completeMaintenance);
router.put("/:id/maintenance", alatController.updateMaintenanceSettings);

module.exports = router;
