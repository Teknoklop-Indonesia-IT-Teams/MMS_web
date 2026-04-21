const express = require("express");
const alatController = require("../controllers/alat.controller.js");

const upload = require("../middleware/upload.js");
const autoHeicConverter = require("../middleware/heicConverter.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/", alatController.getAllAlat);
router.get("/public/by-client/:nama_client", alatController.getPublicAlatByClient);
router.get("/public/:id", alatController.getPublicAlatById);
router.get(
  "/:id/maintenance-status",
  alatController.getEquipmentWithMaintenanceStatus,
);

router.use(authMiddleware);
router.get("/:id", alatController.getAlatById);

router.post(
  "/",
  upload.single("i_alat"), 
  autoHeicConverter,
  alatController.createAlat,
);


router.put(
  "/:id",
  (req, res, next) => {
    next();
  },
  upload.single("i_alat"),
  (req, res, next) => {
    next();
  },
  autoHeicConverter,
  alatController.updateAlat,
);

router.delete("/:id", alatController.deleteAlat);
router.post("/:id/complete-maintenance", alatController.completeMaintenance);
router.put("/:id/maintenance", alatController.updateMaintenanceSettings);
router.post(
  "/:id/maintenance-activity",
  upload.single("image"),
  alatController.addMaintenanceActivity,
);

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
