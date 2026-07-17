const express = require("express");
const { getPreventivePdf, getCorrectivePdf } = require("../controllers/pdf.controller.js");

const router = express.Router();

router.get("/preventive/:id/pdf", getPreventivePdf);

router.get("/corrective/:id/pdf", getCorrectivePdf);

module.exports = router;
