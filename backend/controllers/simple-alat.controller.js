const { db } = require("../config/db.js");

// Simple getAllAlat without complex calculations
const getAllAlat = async (req, res) => {
  try {
    const [alat] = await db.query("SELECT * FROM m_alat ORDER BY id DESC");

    const alatWithSequentialId = alat.map((item, index) => ({
      id: index + 1,
      originalId: item.id,
      nama: item.nama || "",
      lokasi: item.lokasi || "",
      jenis: item.jenis || "",
      instalasi: item.instalasi || "",
      garansi: item.garansi || "",
      remot: item.remot || "",
      status: item.status || "",
      device: item.device || "",
      sensor: item.sensor || "",
      pelanggan: item.pelanggan || "",
      pic: item.pic || "",
      i_alat: item.i_alat || "",
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Basic maintenance fields
      maintenanceDate: item.maintenance_date,
      maintenanceInterval: item.maintenance_interval_days || 90,
      isMaintenanceActive: item.is_maintenance_active,
      maintenanceStatus: item.is_maintenance_active ? "active" : "inactive",
      maintenanceAlertLevel: item.is_maintenance_active ? "green" : "none",
    }));

    res.json(alatWithSequentialId);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fixed delete function
const deleteAlat = async (req, res) => {
  try {
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const originalId = allAlat[sequentialId - 1].id;

    const [result] = await db.query("DELETE FROM m_alat WHERE id = ?", [
      originalId,
    ]);

    res.json({
      message: "Alat berhasil dihapus",
      deletedSequentialId: sequentialId,
      deletedOriginalId: originalId,
    });
  } catch (error) {
    console.error("❌ Error in delete:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllAlat,
  deleteAlat,
};
