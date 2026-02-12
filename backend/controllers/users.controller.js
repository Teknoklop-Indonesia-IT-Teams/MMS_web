const { db } = require("../config/db.js");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id as id, email, nama, role as roleName
      FROM m_user 
      ORDER BY id DESC
    `);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const [user] = await db.query(
      `
      SELECT id as id, email, nama, role as roleName
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

const createUser = async (req, res) => {
  try {
    const { email, password, nama, role } = req.body;

    const [existingUser] = await db.query(
      "SELECT id FROM m_user WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO m_user (email, password, nama, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, nama, role],
    );

    res.status(201).json({
      id: result.insertId,
      email,
      nama,
      role: role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { email, nama, telp, username, role, password } = req.body;

    const [existingUser] = await db.query(
      "SELECT id FROM m_user WHERE email = ? AND id != ? AND isDeleted = 0",
      [email, req.params.id],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    let updateQuery =
      "UPDATE m_user SET email = ?, nama = ?, username = ?, telp = ?, updatedDtm = NOW(), updatedBy = 1";
    let queryParams = [email, nama, username, telp];

    if (role) {
      updateQuery += ", role = ?";
      queryParams.push(role);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }

    updateQuery += " WHERE id = ?";
    queryParams.push(req.params.id);

    await db.query(updateQuery, queryParams);

    res.json({
      id: req.params.id,
      email,
      nama,
      username,
      telp,
      role,
    });

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Update gagal: data sama atau user tidak ditemukan",
      });
    }

    res.json({
      message: "Profile berhasil diperbarui",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await db.query(
      "UPDATE m_user SET isDeleted = 1, updatedDtm = NOW(), updatedBy = 1 WHERE id = ?",
      [req.params.id],
    );
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const restoreUser = async (req, res) => {
  try {
    await db.query(
      "UPDATE m_user SET isDeleted = 0, updatedDtm = NOW(), updatedBy = 1 WHERE id = ?",
      [req.params.id],
    );
    res.json({ message: "User berhasil dipulihkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const id = req.params.id;

    const [users] = await db.query(
      "SELECT password FROM m_user WHERE id = ? AND isDeleted = 0",
      [id],
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isValidPassword = await bcrypt.compare(
      oldPassword,
      users[0].password,
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: "Password lama tidak sesuai" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE m_user SET password = ?, updatedDtm = NOW(), updatedBy = 1 WHERE id = ?",
      [hashedPassword, id],
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
