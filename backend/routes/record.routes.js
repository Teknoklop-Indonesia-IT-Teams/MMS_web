const express = require("express");
const recordController = require("../controllers/record.controller.js");
// const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = express.Router();

// Apply auth middleware to all routes (disabled for testing)
// router.use(authMiddleware);

router.get("/", recordController.getAllRecords);
router.get("/equipment/:id", recordController.getRecordByEquipmentId);
router.get("/:id", recordController.getRecordById);
router.post("/", recordController.createRecord);
router.put("/:id", recordController.updateRecord);
router.delete("/:id", recordController.deleteRecord);

module.exports = router;
