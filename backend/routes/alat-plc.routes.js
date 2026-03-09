const express = require("express");
const alatPlcController = require("../controllers/alat-plc.controller.js");
const upload = require("../middleware/upload.js");
const autoHeicConverter = require("../middleware/heicConverter.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.get("/", alatPlcController.getAllAlatPlc);
router.get("/public/:id", alatPlcController.getAlatPlcById);
router.get("/:id/maintenance-status", alatPlcController.getAlatPlcWithMaintenanceStatus);

// ========== PROTECTED ROUTES ==========
router.use(authMiddleware);
router.get("/:id", alatPlcController.getAlatPlcById);

router.post(
    "/",
    upload.single("i_alat"),
    autoHeicConverter,
    alatPlcController.createAlatPlc
);

router.put(
    "/:id",
    upload.single("i_alat"),
    autoHeicConverter,
    alatPlcController.updateAlatPlc
);

router.delete("/:id", alatPlcController.deleteAlatPlc);
router.post("/:id/complete-maintenance", alatPlcController.completeMaintenancePlc);
router.put("/:id/maintenance", alatPlcController.updateMaintenanceSettingsPlc);

module.exports = router;