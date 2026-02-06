const express = require("express");
const alatController = require("../controllers/alat.controller.js");
const upload = require("../middleware/upload.js"); // Pastikan ini ada
const autoHeicConverter = require("../middleware/heicConverter.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.get("/", alatController.getAllAlat);
router.get("/public/:id", alatController.getPublicAlatById);

// ========== PROTECTED ROUTES ==========
router.use(authMiddleware);

router.get("/:id", alatController.getAlatById);

// CREATE dengan UPLOAD GAMBAR
router.post(
  "/",
  upload.single("i_alat"), // ← MIDDLEWARE UPLOAD DI SINI
  autoHeicConverter,
  alatController.createAlat,
);

// UPDATE dengan UPLOAD GAMBAR
router.put(
  "/:id",
  upload.single("i_alat"), // ← MIDDLEWARE UPLOAD DI SINI
  autoHeicConverter,
  alatController.updateAlat,
);

router.delete("/:id", alatController.deleteAlat);
router.post("/:id/stop-maintenance", alatController.stopMaintenance);
router.post("/:id/complete-maintenance", alatController.completeMaintenance);
router.put("/:id/maintenance", alatController.updateMaintenanceSettings);
router.post(
  "/:id/maintenance-activity",
  upload.single("image"),
  alatController.addMaintenanceActivity,
);

// ========== DEBUG ROUTE ==========
router.post("/debug-upload", upload.single("i_alat"), (req, res) => {
  res.json({
    success: true,
    file: req.file
      ? {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        }
      : null,
    message: "Debug upload test",
  });
});

module.exports = router;
