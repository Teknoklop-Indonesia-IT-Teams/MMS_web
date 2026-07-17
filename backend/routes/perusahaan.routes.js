const express = require("express");
const router = express.Router();
const { getAllPerusahaan } = require("../controllers/perusahaan.controller");

router.get("/", getAllPerusahaan);

module.exports = router;
