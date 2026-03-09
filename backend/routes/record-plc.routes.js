const express = require("express");
const recordPlcController = require("../controllers/record-plc.controller.js");
const upload = require("../middleware/upload");

const router = express.Router();

// ========== CORRECTIVE ==========
router.get("/corrective/", recordPlcController.getAllCorrectiveRecordsPlc);
router.get("/corrective/equipment/:id", recordPlcController.getCorrectiveRecordPlcByEquipmentId);
router.get("/corrective/:id", recordPlcController.getCorrectiveRecordPlcById);
router.post("/corrective/", upload.array("i_alat", 10), recordPlcController.createCorrectiveRecordPlc);
router.put("/corrective/:id", recordPlcController.updateCorrectiveRecordPlc);
router.delete("/corrective/:id", recordPlcController.deleteCorrectiveRecordPlc);

// ========== PREVENTIVE ==========
router.get("/", recordPlcController.getAllRecordsPlc);
router.get("/equipment/:id", recordPlcController.getRecordPlcByEquipmentId);
router.get("/:id", recordPlcController.getRecordPlcById);
router.post("/", upload.array("i_alat", 10), recordPlcController.createRecordPlc);
router.put("/:id", recordPlcController.updateRecordPlc);
router.delete("/:id", recordPlcController.deleteRecordPlc);

module.exports = router;