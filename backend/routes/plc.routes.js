const express = require("express");
const router = express.Router();
const {
    getAllPlc,
    getPlcById,
    createPlc,
    updatePlc,
    deletePlc,
} = require("../controllers/plc.controller");

router.get("/", getAllPlc);
router.get("/:id", getPlcById);
router.post("/", createPlc);
router.put("/:id", updatePlc);
router.delete("/:id", deletePlc);

module.exports = router;