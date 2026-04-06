const express = require("express");
const router = express.Router();
const {
    getAllClient,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
} = require("../controllers/client.controller");

router.get("/", getAllClient);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
