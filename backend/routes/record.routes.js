const express = require("express");
const recordController = require("../controllers/record.controller.js");
const upload = require("../middleware/upload");

const router = express.Router();

// Corrective Maintenance Records
router.get("/corrective/", recordController.getAllCorrectiveRecords);
router.get(
  "/corrective/equipment/:id",
  recordController.getCorrectiveRecordByEquipmentId,
);
router.get("/corrective/:id", recordController.getCorrectiveRecordById);
router.post("/corrective/", recordController.createCorrectiveRecord);
router.put("/corrective/:id", recordController.updateCorrectiveRecord);
router.delete("/corrective/:id", recordController.deleteCorrectiveRecord);

// Preventive Maintenance Records
router.get("/", recordController.getAllRecords);
router.get("/equipment/:id", recordController.getRecordByEquipmentId);
router.get("/:id", recordController.getRecordById);
router.post("/", upload.single("i_alat"), recordController.createRecord);
router.put("/:id", recordController.updateRecord);
router.delete("/:id", recordController.deleteRecord);

module.exports = router;
