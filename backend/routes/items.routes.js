const express = require("express");
const router = express.Router();
const itemController = require("../controllers/items.controller");
const { upload } = require("../middleware/auth.middleware");

router.use((req, res, next) => {
  next();
});

router.get("/", itemController.getAllItems);

router.get("/:id", itemController.getItemById);

router.post("/", upload.single("image"), itemController.createItem);

router.put("/:id", upload.single("image"), itemController.updateItem);

router.delete("/:id", itemController.deleteItem);

router.patch("/:id/restore", itemController.restoreItem);

module.exports = router;
