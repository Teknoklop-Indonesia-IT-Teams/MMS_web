const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { db } = require("../config/db.js");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const { nama, email, password, telp, role, username } = req.body;

    // Validate required fields
    // if (!nama || !email || !password || !telp || !role || !username) {
    //   return res.status(400).json({ message: "All fields are required" });
    // }

    // Validate role is a number
    // if (isNaN(role) || role < 1) {
    //   return res
    //     .status(400)
    //     .json({ message: "Valid role selection is required" });
    // }

    // Check if email exists in m_user
    const [existingEmails] = await db.query(
      "SELECT * FROM m_user WHERE email = ?",
      [email],
    );
    if (existingEmails.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const [roles] = await db.query(
      "SELECT roleId, roleName FROM tbl_roles WHERE id = ?",
      [role],
    );

    if (roles.length === 0) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    const roleData = roles[0]; // { id, role_name }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get current date
    const now = new Date();

    // Insert user into m_user
    const [result] = await db.query(
      "INSERT INTO m_user (email, password, nama, role, username, telp) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, nama, roleData.roleId, username, telp],
    );

    // Send notification email to admin
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || "admin@company.com",
        subject: "New User Registration - MMS System",
        html: `
          <h3>New User Registration Request</h3>
          <p><strong>Name:</strong> ${nama}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobile:</strong> ${telp}</p>
          <p><strong>Role ID:</strong> ${role}</p>
          <p><strong>Usernama:</strong> ${username}</p>
          <p><strong>Telp:</strong> ${telp}</p>
          <p>Please review and approve this registration in the admin panel.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
    }

    res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if user exists in m_user table
    const [users] = await db.query(
      "SELECT * FROM m_user WHERE email = ? || username = ?",
      [email, username],
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Check password (assuming we've added password column)
    if (!user.password) {
      return res.status(500).json({ message: "Account setup incomplete" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token with 1 day expiration
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      nama: user.nama,
      username: user.username,
      telp: user.telp,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }, // 24 hours
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: "/", // Available for all routes
    };

    // Set token as httpOnly cookie
    res.cookie("accessToken", token, cookieOptions);

    // Also send token in response for localStorage fallback
    res.json({
      token,
      user: {
        userId: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        username: user.username,
        telp: user.telp,
      },
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const [users] = await db.query("SELECT * FROM m_user WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await db.query(
      "UPDATE m_user SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, resetTokenExpiry, user.id],
    );

    // Send reset email
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5174"
      }/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset - MMS System",
        html: `
          <h3>Password Reset Request</h3>
          <p>Hello ${user.nama},</p>
          <p>You requested a password reset for your MMS account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>MMS Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      return res.status(500).json({ message: "Error sending reset email" });
    }

    res.json({
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Find user with valid reset token
    const [users] = await db.query(
      "SELECT * FROM m_user WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token],
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const user = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await db.query(
      "UPDATE m_user SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id],
    );

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout function
const logout = async (req, res) => {
  try {
    // Clear the httpOnly cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile (for auth verification)
const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get fresh user data from database
    const [users] = await db.query("SELECT * FROM m_user WHERE id = ?", [
      req.user.id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.json({
      userId: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      username: user.username,
      telp: user.telp,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
};
