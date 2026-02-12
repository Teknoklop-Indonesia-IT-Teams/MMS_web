const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");

router.use((req, res, next) => {
  next();
});

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.post("/", userController.createUser);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

router.patch("/:id/restore", userController.restoreUser);

router.patch("/:id/password", userController.changePassword);

module.exports = router;
