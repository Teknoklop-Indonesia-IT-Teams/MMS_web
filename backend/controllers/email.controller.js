const nodemailer = require("nodemailer");

// Konfigurasi email transporter untuk testing
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: "alirohman857@gmail.com",
      pass: "your-app-password", // Perlu diganti dengan App Password Gmail yang sebenarnya
    },
  });
};

// Function untuk mengirim email maintenance warning (status kuning)
const sendMaintenanceWarning = async (req, res) => {
  try {
    const { equipmentName, equipmentId, location, pic, email } = req.body;

    console.log(`📧 Sending warning email for equipment: ${equipmentName}`);

    // Untuk testing, kita simulasikan pengiriman email
    const transporter = createTransporter();

    const mailOptions = {
      from: "alirohman857@gmail.com",
      to: "alirohman857@gmail.com", // Testing mode - semua email ke sini
      subject: `⚠️ Warning: Maintenance Required - ${equipmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fbbf24; padding: 20px; color: white; text-align: center;">
            <h2>⚠️ Maintenance Warning</h2>
          </div>
          <div style="padding: 20px; background: #fff; border: 1px solid #ddd;">
            <p>Peralatan berikut memerlukan perhatian maintenance:</p>
            <ul>
              <li><strong>Nama:</strong> ${equipmentName}</li>
              <li><strong>ID:</strong> ${equipmentId}</li>
              <li><strong>Lokasi:</strong> ${location}</li>
              <li><strong>PIC:</strong> ${pic}</li>
            </ul>
            <p style="color: #666; font-size: 12px;">
              Testing Mode: Original email tujuan: ${email}
            </p>
          </div>
        </div>
      `,
    };

    // Simulasi pengiriman email (uncomment untuk pengiriman sesungguhnya)
    // await transporter.sendMail(mailOptions);

    console.log("✅ Warning email simulated successfully");
    res.status(200).json({
      success: true,
      message: "Warning email sent successfully (simulated)",
      originalRecipient: email,
      testRecipient: "alirohman857@gmail.com",
    });
  } catch (error) {
    console.error("Error sending warning email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send warning email",
      error: error.message,
    });
  }
};

// Function untuk mengirim email maintenance urgent (status merah)
const sendMaintenanceUrgent = async (req, res) => {
  try {
    const { equipmentName, equipmentId, location, pic, email } = req.body;

    console.log(`📧 Sending urgent email for equipment: ${equipmentName}`);

    const transporter = createTransporter();

    const mailOptions = {
      from: "alirohman857@gmail.com",
      to: "alirohman857@gmail.com",
      subject: `🚨 URGENT: Maintenance Required - ${equipmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; padding: 20px; color: white; text-align: center;">
            <h2>🚨 URGENT MAINTENANCE</h2>
          </div>
          <div style="padding: 20px; background: #fff; border: 1px solid #ddd;">
            <p><strong>PERHATIAN:</strong> Peralatan berikut memerlukan maintenance SEGERA!</p>
            <ul>
              <li><strong>Nama:</strong> ${equipmentName}</li>
              <li><strong>ID:</strong> ${equipmentId}</li>
              <li><strong>Lokasi:</strong> ${location}</li>
              <li><strong>PIC:</strong> ${pic}</li>
            </ul>
            <p style="color: #666; font-size: 12px;">
              Testing Mode: Original email tujuan: ${email}
            </p>
          </div>
        </div>
      `,
    };

    // Simulasi pengiriman email
    // await transporter.sendMail(mailOptions);

    console.log("✅ Urgent email simulated successfully");
    res.status(200).json({
      success: true,
      message: "Urgent email sent successfully (simulated)",
      originalRecipient: email,
      testRecipient: "alirohman857@gmail.com",
    });
  } catch (error) {
    console.error("Error sending urgent email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send urgent email",
      error: error.message,
    });
  }
};

const sendMaintenanceResolved = async (req, res) => {
  try {
    console.log("📧 Resolved email function called");
    res
      .status(200)
      .json({ success: true, message: "Resolved email sent (simulated)" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to send resolved email" });
  }
};

const sendMaintenanceWarningReminder = async (req, res) => {
  try {
    console.log("📧 Warning reminder email function called");
    res
      .status(200)
      .json({ success: true, message: "Warning reminder sent (simulated)" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to send warning reminder" });
  }
};

const sendMaintenanceUrgentReminder = async (req, res) => {
  try {
    console.log("📧 Urgent reminder email function called");
    res
      .status(200)
      .json({ success: true, message: "Urgent reminder sent (simulated)" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to send urgent reminder" });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const { equipmentName = "Test Equipment", equipmentId = "TEST-001" } =
      req.body;

    console.log(`📧 Sending test email for equipment: ${equipmentName}`);

    // Simulasi test email
    console.log("✅ Test email simulated successfully");
    res.status(200).json({
      success: true,
      message: "Test email sent successfully (simulated)",
      recipient: "alirohman857@gmail.com",
      note: "To enable real email sending, configure Gmail App Password and uncomment transporter.sendMail()",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};

module.exports = {
  sendMaintenanceWarning,
  sendMaintenanceUrgent,
  sendMaintenanceResolved,
  sendMaintenanceWarningReminder,
  sendMaintenanceUrgentReminder,
  sendTestEmail,
};
