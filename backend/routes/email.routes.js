const express = require("express");
const router = express.Router();
const emailController = require("../controllers/email.controller");

router.get("/", (req, res) => {
  res.json({
    message: "Email API Endpoints",
    status: "Email service is running",
    available_endpoints: {
      "POST /api/email/maintenance-warning":
        "Send maintenance warning email (yellow status)",
      "POST /api/email/maintenance-urgent":
        "Send urgent maintenance email (red status)",
      "POST /api/email/maintenance-resolved":
        "Send maintenance resolved email (green status)",
      "POST /api/email/maintenance-warning-reminder":
        "Send warning reminder email",
      "POST /api/email/maintenance-urgent-reminder":
        "Send urgent reminder email",
      "POST /api/email/test": "Send test email",
      "GET /api/email/test": "Send test email (GET method)",
    },
    description:
      "Use these endpoints to send various types of maintenance notification emails",
  });
});

router.post("/maintenance-warning", emailController.sendMaintenanceWarning);

router.post("/maintenance-urgent", emailController.sendMaintenanceUrgent);

router.post("/maintenance-resolved", emailController.sendMaintenanceResolved);

router.post(
  "/maintenance-warning-reminder",
  emailController.sendMaintenanceWarningReminder,
);

router.post(
  "/maintenance-urgent-reminder",
  emailController.sendMaintenanceUrgentReminder,
);

router.post("/test", emailController.sendTestEmail);
router.get("/test", emailController.sendTestEmail);

module.exports = router;
