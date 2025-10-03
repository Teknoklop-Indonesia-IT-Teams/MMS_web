const { db } = require("../config/db.js");

const getAllStaff = async (req, res) => {
  try {
    console.log("🔄 Getting all staff from m_user...");

    const [staff] = await db.query(
      "SELECT id, petugas, email FROM m_user ORDER BY id ASC"
    );

    console.log("Raw staff data from m_user:", staff);

    // Map to expected format
    const mappedStaff = staff.map((item) => ({
      id: item.id,
      nama: item.petugas,
      petugas: item.petugas,
      role: "staff",
      username: item.petugas.toLowerCase().replace(/\s+/g, ""),
      email: item.email || "Tidak ada email",
    }));

    console.log("Mapped staff data:", mappedStaff);
    console.log("✅ Staff data retrieved, count:", mappedStaff.length);
    res.json(mappedStaff);
  } catch (error) {
    console.error("❌ Error in getAllStaff:", error.message);
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
    console.log("🆕 Creating staff:", { nama, email });

    if (!nama) {
      return res.status(400).json({ message: "Nama is required" });
    }

    const [result] = await db.query(
      "INSERT INTO m_user (petugas, email) VALUES (?, ?)",
      [nama, email || null]
    );

    console.log("✅ Staff created with ID:", result.insertId);

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

    console.log("🔄 Updating staff:", { id: staffId, nama, email });

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

    console.log("✅ Staff updated successfully");

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
    console.log("🗑️ Deleting staff:", staffId);

    await db.query("DELETE FROM m_user WHERE id = ?", [staffId]);

    console.log("✅ Staff deleted successfully");
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
