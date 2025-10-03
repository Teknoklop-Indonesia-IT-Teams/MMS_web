const express = require("express");
const router = express.Router();
const emailController = require("../controllers/email.controller");

// Root email endpoint - menampilkan informasi endpoints yang tersedia
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

// Route untuk mengirim email warning maintenance (status kuning)
router.post("/maintenance-warning", emailController.sendMaintenanceWarning);

// Route untuk mengirim email urgent maintenance (status merah)
router.post("/maintenance-urgent", emailController.sendMaintenanceUrgent);

// Route untuk mengirim email maintenance resolved (status hijau)
router.post("/maintenance-resolved", emailController.sendMaintenanceResolved);

// Route untuk mengirim reminder email warning (status kuning)
router.post(
  "/maintenance-warning-reminder",
  emailController.sendMaintenanceWarningReminder
);

// Route untuk mengirim reminder email urgent (status merah)
router.post(
  "/maintenance-urgent-reminder",
  emailController.sendMaintenanceUrgentReminder
);

// Route untuk test email functionality
router.post("/test", emailController.sendTestEmail);
router.get("/test", emailController.sendTestEmail);

module.exports = router;
