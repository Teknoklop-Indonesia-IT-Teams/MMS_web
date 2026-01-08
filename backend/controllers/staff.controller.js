const { db } = require("../config/db.js");

const getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query(
      "SELECT id, petugas, email FROM m_user ORDER BY id ASC"
    );
    // Map to expected format
    const mappedStaff = staff.map((item) => ({
      id: item.id,
      nama: item.petugas,
      petugas: item.petugas,
      role: "staff",
      username: item.petugas.toLowerCase().replace(/\s+/g, ""),
      email: item.email || "Tidak ada email",
    }));
    res.json(mappedStaff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staffId = parseInt(req.params.id);

    const [staff] = await db.query(
      "SELECT id, petugas, email FROM m_user WHERE id = ?",
      [staffId]
    );

    if (staff.length === 0) {
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    }

    const result = {
      id: staff[0].id,
      nama: staff[0].petugas,
      petugas: staff[0].petugas,
      role: "staff",
      username: staff[0].petugas.toLowerCase().replace(/\s+/g, ""),
      email: staff[0].email,
    };

    res.json(result);
  } catch (error) {
    console.error("Error in getStaffById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { nama, email } = req.body;

    if (!nama) {
      return res.status(400).json({ message: "Nama is required" });
    }

    const [result] = await db.query(
      "INSERT INTO m_user (petugas, email) VALUES (?, ?)",
      [nama, email || null]
    );

    res.status(201).json({
      id: result.insertId,
      nama: nama,
      petugas: nama,
      role: "staff",
      username: nama.toLowerCase().replace(/\s+/g, ""),
      email: email || null,
    });
  } catch (error) {
    console.error("Error in createStaff:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { nama, email } = req.body;
    const staffId = parseInt(req.params.id);

    if (!nama) {
      return res.status(400).json({ message: "Nama is required" });
    }

    // First check if the staff exists
    const [existingStaff] = await db.query(
      "SELECT id, petugas FROM m_user WHERE id = ?",
      [staffId]
    );

    if (existingStaff.length === 0) {
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    }

    // Update staff with email
    await db.query("UPDATE m_user SET petugas = ?, email = ? WHERE id = ?", [
      nama,
      email || null,
      staffId,
    ]);

    res.json({
      id: staffId,
      nama: nama,
      petugas: nama,
      role: "staff",
      username: nama.toLowerCase().replace(/\s+/g, ""),
      email: email || null,
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
