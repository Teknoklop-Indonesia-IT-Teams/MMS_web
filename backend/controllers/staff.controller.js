const { db } = require("../config/db.js");

const getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query("SELECT * FROM m_user ORDER BY id ASC");
    // Map to expected format
    const mappedStaff = staff.map((item) => ({
      id: item.id,
      nama: item.nama,
      role: item.role,
      username: item.username,
      email: item.email || "Tidak ada email",
      telp: item.telp || "Tidak ada telp",
    }));
    res.json(mappedStaff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staffId = parseInt(req.params.id);

    const [staff] = await db.query("SELECT * FROM m_user WHERE id = ?", [
      staffId,
    ]);

    if (staff.length === 0) {
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    }

    const result = {
      id: staff[0].id,
      nama: staff[0].nama,
      role: staff[0].role,
      username: staff[0].username,
      email: staff[0].email,
      telp: staff[0].telp,
    };

    res.json(result);
  } catch (error) {
    console.error("Error in getStaffById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { nama, email, role, username, telp } = req.body;

    if (!nama) {
      return res.status(400).json({ message: "Nama is required" });
    }

    const [result] = await db.query(
      "INSERT INTO m_user (nama, email, role, username, telp) VALUES (?, ?, ?, ?, ?)",
      [nama, email || null, role, username, telp || null],
    );

    res.status(201).json({
      id: result.insertId,
      nama: nama,
      email: email || null,
      role: role,
      username: username,
      telp: telp || null,
    });
  } catch (error) {
    console.error("Error in createStaff:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { nama, email, role, username, telp } = req.body;
    const staffId = parseInt(req.params.id);

    if (!nama) {
      return res.status(400).json({ message: "Nama is required" });
    }

    // First check if the staff exists
    const [existingStaff] = await db.query(
      "SELECT id, nama, email, role, username, telp FROM m_user WHERE id = ?",
      [staffId],
    );

    if (existingStaff.length === 0) {
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    }

    // Update staff with email
    await db.query(
      "UPDATE m_user SET nama = ?, email = ?, role = ?, username = ?, telp = ? WHERE id = ?",
      [nama, email || null, role, username, telp || null, staffId],
    );

    res.json({
      id: staffId,
      nama: nama,
      role: role,
      username: username,
      email: email || null,
      telp: telp || null,
    });
  } catch (error) {
    console.error("Error in updateStaff:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staffId = parseInt(req.params.id);
    await db.query("DELETE FROM m_user WHERE id = ?", [staffId]);
    res.json({ message: "Petugas berhasil dihapus" });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};
