const express = require("express");
const router = express.Router();
const {
    getAllTelemetry,
    getTelemetryById,
    createTelemetry,
    updateTelemetry,
    deleteTelemetry,
} = require("../controllers/telemetry.controller");

router.get("/", getAllTelemetry);
router.get("/:id", getTelemetryById);
router.post("/", createTelemetry);
router.put("/:id", updateTelemetry);
router.delete("/:id", deleteTelemetry);

module.exports = router;