const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roles.controller");

router.use((req, res, next) => {
  next();
});

router.get("/", roleController.getRoles);

router.get("/all", roleController.getAllRoles);

router.get("/:id", roleController.getRoleById);

router.post("/", roleController.createRole);

router.put("/:id", roleController.updateRole);

router.delete("/:id", roleController.deleteRole);

module.exports = router;
