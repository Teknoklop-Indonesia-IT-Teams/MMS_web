const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roles.controller");

// Debug logging
router.use((req, res, next) => {
  console.log(`[Roles Router] ${req.method} ${req.path}`);
  next();
});

// Get roles for frontend signup form
router.get("/", roleController.getRoles);

// Get all roles (admin)
router.get("/all", roleController.getAllRoles);

// Get role by ID
router.get("/:id", roleController.getRoleById);

// Create new role
router.post("/", roleController.createRole);

// Update role
router.put("/:id", roleController.updateRole);

// Delete role
router.delete("/:id", roleController.deleteRole);

module.exports = router;
