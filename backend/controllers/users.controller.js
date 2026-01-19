const { db } = require("../config/db.js");
const bcrypt = require("bcrypt");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id as userId, email, petugas as name, role as roleName
      FROM m_user 
      ORDER BY id DESC
    `);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const [user] = await db.query(
      `
      SELECT id as userId, email, petugas as name, role as roleName
      FROM m_user 
      WHERE id = ?
    `,
      [req.params.id],
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(user[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if email already exists
    const [existingUser] = await db.query(
      "SELECT id FROM m_user WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO m_user (email, password, petugas, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, name, role || "engineer"],
    );

    res.status(201).json({
      userId: result.insertId,
      email,
      name,
      role: role || "engineer",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { email, name, mobile, roleId, password } = req.body;

    // Check if email already exists for other users
    const [existingUser] = await db.query(
      "SELECT userId FROM tbl_users WHERE email = ? AND userId != ? AND isDeleted = 0",
      [email, req.params.id],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    let updateQuery =
      "UPDATE tbl_users SET email = ?, name = ?, mobile = ?, roleId = ?, updatedDtm = NOW(), updatedBy = 1";
    let queryParams = [email, name, mobile, roleId];

    // Only update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }

    updateQuery += " WHERE userId = ?";
    queryParams.push(req.params.id);

    await db.query(updateQuery, queryParams);

    res.json({
      userId: req.params.id,
      email,
      name,
      mobile,
      roleId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    await db.query(
      "UPDATE tbl_users SET isDeleted = 1, updatedDtm = NOW(), updatedBy = 1 WHERE userId = ?",
      [req.params.id],
    );
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore soft deleted user
const restoreUser = async (req, res) => {
  try {
    await db.query(
      "UPDATE tbl_users SET isDeleted = 0, updatedDtm = NOW(), updatedBy = 1 WHERE userId = ?",
      [req.params.id],
    );
    res.json({ message: "User berhasil dipulihkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Get current user
    const [users] = await db.query(
      "SELECT password FROM tbl_users WHERE userId = ? AND isDeleted = 0",
      [userId],
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      users[0].password,
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: "Password lama tidak sesuai" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      "UPDATE tbl_users SET password = ?, updatedDtm = NOW(), updatedBy = 1 WHERE userId = ?",
      [hashedPassword, userId],
    );

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  changePassword,
};
