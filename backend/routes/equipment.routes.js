import express from "express";
import * as equipmentController from "../controllers/equipment.controller.js";

const router = express.Router();

router.get("/", equipmentController.getAllEquipment);
router.get("/:id", equipmentController.getEquipmentById);
router.post("/", equipmentController.createEquipment);
router.put("/:id", equipmentController.updateEquipment);
router.delete("/:id", equipmentController.deleteEquipment);

export default router;
