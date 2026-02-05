const { db } = require("../config/db.js");

const getAllAlat = async (req, res) => {
  try {
    console.log("🔍 Executing getAllAlat query...");
    // Pertama, cek struktur tabel
    const [tableInfo] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'm_alat'
      ORDER BY ORDINAL_POSITION
    `);
    console.log("📊 Table structure:", tableInfo);

    const [alat] = await db.query("SELECT * FROM m_alat ORDER BY id DESC");
    console.log(`📊 Found ${alat.length} equipment records`);

    if (alat.length > 0) {
      console.log("📋 First equipment record:", {
        id: alat[0].id,
        nama: alat[0].nama,
        i_alat: alat[0].i_alat,
        maintenance_fields: {
          maintenance_date: alat[0].maintenance_date,
          maintenance_interval_days: alat[0].maintenance_interval_days,
          is_maintenance_active: alat[0].is_maintenance_active,
          // Cek semua kemungkinan nama kolom
          isMaintenanceActive: alat[0].isMaintenanceActive,
          isMaintenance_active: alat[0].isMaintenance_active,
        },
      });
    }

    // Calculate maintenance status for each equipment
    const alatWithSequentialId = alat.map((item, index) => {
      const sequentialId = alat.length - index;

      // Calculate maintenance status
      let maintenanceStatus = "inactive";
      let maintenanceAlertLevel = "none";
      let maintenanceDaysLeft = null;
      let nextMaintenanceDate = null;
      let maintenanceStatusText = "";

      // Check if maintenance is active and columns exist
      // Convert to proper boolean
      const isActive =
        item.is_maintenance_active === 1 ||
        item.is_maintenance_active === true ||
        item.is_maintenance_active === "1" ||
        (typeof item.is_maintenance_active === "string" &&
          item.is_maintenance_active.toLowerCase() === "true");

      if (isActive) {
        if (item.maintenance_date && item.maintenance_interval_days) {
          const today = new Date();
          const lastMaintenanceDate = new Date(item.maintenance_date);
          const intervalDays = parseInt(item.maintenance_interval_days) || 90;

          // Calculate next maintenance date
          nextMaintenanceDate = new Date(lastMaintenanceDate);
          nextMaintenanceDate.setDate(
            nextMaintenanceDate.getDate() + intervalDays,
          );

          // Calculate days left
          const timeDiff = nextMaintenanceDate.getTime() - today.getTime();
          maintenanceDaysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Determine status and alert level
          if (maintenanceDaysLeft <= 0) {
            maintenanceStatus = "overdue";
            maintenanceAlertLevel = "red";
            maintenanceStatusText = "Terlambat maintenance";
          } else if (maintenanceDaysLeft <= 14) {
            maintenanceStatus = "urgent";
            maintenanceAlertLevel = "red";
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Urgent)`;
          } else if (maintenanceDaysLeft <= 30) {
            maintenanceStatus = "needed";
            maintenanceAlertLevel = "yellow";
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Diperlukan)`;
          } else {
            maintenanceStatus = "good";
            maintenanceAlertLevel = "green";
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi`;
          }
        } else {
          // Equipment has maintenance active but no date set
          maintenanceStatus = "needed";
          maintenanceAlertLevel = "yellow";
          maintenanceStatusText = "Maintenance belum dijadwalkan";
          maintenanceDaysLeft = null;
        }
      } else if (item.maintenance_date && item.maintenance_interval_days) {
        // Equipment is not currently under maintenance but has maintenance schedule
        const today = new Date();
        const lastMaintenanceDate = new Date(item.maintenance_date);
        const intervalDays = parseInt(item.maintenance_interval_days) || 90;

        // Check if maintenance was completed today
        const isSameDay =
          today.getFullYear() === lastMaintenanceDate.getFullYear() &&
          today.getMonth() === lastMaintenanceDate.getMonth() &&
          today.getDate() === lastMaintenanceDate.getDate();

        if (isSameDay) {
          maintenanceStatus = "selesai";
          maintenanceAlertLevel = "blue";
          maintenanceStatusText = "Maintenance selesai hari ini";
        } else {
          // Calculate next maintenance date
          nextMaintenanceDate = new Date(lastMaintenanceDate);
          nextMaintenanceDate.setDate(
            nextMaintenanceDate.getDate() + intervalDays,
          );

          // Calculate days left
          const timeDiff = nextMaintenanceDate.getTime() - today.getTime();
          maintenanceDaysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Determine status
          if (maintenanceDaysLeft <= 0) {
            maintenanceStatus = "overdue";
            maintenanceAlertLevel = "red";
            maintenanceStatusText = "Terlambat maintenance";
          } else if (maintenanceDaysLeft <= 14) {
            maintenanceStatus = "urgent";
            maintenanceAlertLevel = "red";
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Urgent)`;
          } else if (maintenanceDaysLeft <= 30) {
            maintenanceStatus = "needed";
            maintenanceAlertLevel = "yellow";
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Diperlukan)`;
          } else {
            maintenanceStatus = "good";
            maintenanceAlertLevel = "green";
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi`;
          }
        }
      } else {
        // No maintenance schedule
        maintenanceStatus = "inactive";
        maintenanceAlertLevel = "none";
        maintenanceStatusText = "Tidak ada jadwal maintenance";
      }

      return {
        id: item.id,
        displayId: sequentialId,
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
        email: item.email || "",
        i_alat: item.i_alat || "",
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Maintenance fields
        maintenanceDate: item.maintenance_date,
        maintenanceInterval: item.maintenance_interval_days || 90,
        isMaintenanceActive: Boolean(item.is_maintenance_active),
        maintenanceStatus: maintenanceStatus,
        maintenanceAlertLevel: maintenanceAlertLevel,
        maintenanceDaysLeft: maintenanceDaysLeft,
        maintenanceStatusText: maintenanceStatusText,
        nextMaintenanceDate: nextMaintenanceDate,
      };
    });
    res.json(alatWithSequentialId);
  } catch (error) {
    console.error("❌ Error in getAllAlat:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getAlatById = async (req, res) => {
  try {
    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);
    // Enhanced validation
    if (isNaN(sequentialId) || sequentialId < 1) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    if (sequentialId > allAlat.length) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Reverse mapping: data terbaru (index 0) = ID tertinggi
    // Jika total 9 data: Sequential ID 9 = index 0, Sequential ID 1 = index 8
    const arrayIndex = allAlat.length - sequentialId;

    // Additional safety check
    if (arrayIndex < 0 || arrayIndex >= allAlat.length) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const originalId = allAlat[arrayIndex].id;
    const id = parseInt(req.params.id);

    const [alat] = await db.query("SELECT * FROM m_alat WHERE id = ?", [
      id,
    ]);

    if (alat.length === 0) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Add sequential ID to response
    const result = { ...alat[0], id: sequentialId, originalId: originalId };
    res.json(result);
  } catch (error) {
    console.error("❌ getAlatById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAlat = async (req, res) => {
  try {
    console.log("\n========== CREATE ALAT START ==========");

    // DEBUG: Log semua yang ada di request
    console.log("📤 REQUEST DETAILS:");
    console.log("- Headers:", {
      "content-type": req.headers["content-type"],
      "content-length": req.headers["content-length"],
    });
    console.log("- Body keys:", Object.keys(req.body));
    console.log(
      "- File:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
          }
        : "NO FILE",
    );

    // Log semua body fields
    for (const [key, value] of Object.entries(req.body)) {
      console.log(
        `  ${key}:`,
        typeof value === "string" ? value.substring(0, 100) : value,
      );
    }

    const {
      nama,
      lokasi,
      jenis,
      instalasi,
      garansi,
      remot,
      status,
      device,
      sensor,
      pelanggan,
      pic,
      email,
      maintenanceDate,
      maintenanceInterval,
      isMaintenanceActive,
    } = req.body;

    // ========== HANDLE FILE UPLOAD ==========
    let i_alat = null;

    if (req.file) {
      i_alat = req.file.filename; // Store only the filename
      console.log("✅ File uploaded successfully:", req.file.filename);
    } else {
      console.log("⚠️ No file uploaded");
    }

    // ========== VALIDASI DATA ==========
    if (!nama || !lokasi || !jenis) {
      return res.status(400).json({
        message: "Nama, lokasi, dan jenis wajib diisi",
      });
    }

    // ========== SAVE TO DATABASE ==========
    const is_maintenance_active =
      isMaintenanceActive === true ||
      isMaintenanceActive === "true" ||
      isMaintenanceActive === 1 ||
      isMaintenanceActive === "1"
        ? 1
        : 0;

    const query = `
      INSERT INTO m_alat (
        nama, lokasi, jenis, instalasi, garansi, remot, status,
        device, sensor, pelanggan, pic, email, i_alat,
        maintenance_date, maintenance_interval_days, is_maintenance_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      nama,
      lokasi,
      jenis,
      instalasi || null,
      garansi || null,
      remot || "off",
      status || "Garansi",
      device || null,
      sensor || null,
      pelanggan || null,
      pic || null,
      email || null,
      i_alat || null, // Store the blob
      maintenanceDate || new Date().toISOString().split("T")[0],
      maintenanceInterval || 90,
      is_maintenance_active,
    ];

    const [result] = await db.query(query, params);

    // ========== RESPONSE ==========
    const responseData = {
      id: result.insertId,
      nama,
      lokasi,
      jenis,
      instalasi: instalasi || null,
      garansi: garansi || null,
      remot: remot || "off",
      status: status || "Garansi",
      device: device || null,
      sensor: sensor || null,
      pelanggan: pelanggan || null,
      pic: pic || null,
      email: email || null,
      i_alat: i_alat || null, // Blob data
      maintenanceDate:
        maintenanceDate || new Date().toISOString().split("T")[0],
      maintenanceInterval: maintenanceInterval || 90,
      isMaintenanceActive: Boolean(is_maintenance_active),
      message: "Alat berhasil ditambahkan",
    };
    res.status(201).json(responseData);
  } catch (error) {
    console.error("\n❌❌❌ CREATE ALAT ERROR ❌❌❌");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    if (error.sql) {
      console.error("SQL Error:", error.sqlMessage);
      console.error("SQL Query:", error.sql);
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
      sqlError: error.sqlMessage,
    });
  }
};

const updateAlat = async (req, res) => {
  try {
    // Get original ID dari sequential ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;

    // Get existing data
    const [existingAlat] = await db.query("SELECT * FROM m_alat WHERE id = ?", [
      originalId,
    ]);
    if (existingAlat.length === 0) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const existingData = existingAlat[0];

    const {
      nama,
      lokasi,
      jenis,
      instalasi,
      garansi,
      remot,
      status,
      device,
      sensor,
      pelanggan,
      pic,
      email,
      maintenanceDate,
      maintenanceInterval,
      isMaintenanceActive,
    } = req.body;

    // ========== HANDLE IMAGE ==========
    let i_alat = existingData.i_alat; // Default: keep existing

    if (req.file) {
      // Ada file baru → update dengan filename baru
      i_alat = req.file.filename;
    } else if (req.body.removeImage === "true") {
      // Client minta hapus gambar
      i_alat = null;
    }
    // Convert maintenance values
    const processedMaintenanceDate =
      maintenanceDate && maintenanceDate !== ""
        ? maintenanceDate
        : existingData.maintenance_date;

    const processedMaintenanceInterval =
      parseInt(maintenanceInterval) ||
      existingData.maintenance_interval_days ||
      90;

    const processedIsMaintenanceActive =
      isMaintenanceActive !== undefined
        ? isMaintenanceActive === true ||
          isMaintenanceActive === "true" ||
          isMaintenanceActive === 1 ||
          isMaintenanceActive === "1"
          ? 1
          : 0
        : existingData.is_maintenance_active;

    // Query UPDATE
    const updateQuery = `
      UPDATE m_alat 
      SET 
        nama = ?, 
        lokasi = ?, 
        jenis = ?, 
        instalasi = ?, 
        garansi = ?, 
        remot = ?, 
        status = ?, 
        device = ?, 
        sensor = ?, 
        pelanggan = ?, 
        pic = ?, 
        email = ?, 
        i_alat = ?,
        maintenance_date = ?, 
        maintenance_interval_days = ?, 
        is_maintenance_active = ?
      WHERE id = ?
    `;

    const [result] = await db.query(updateQuery, [
      nama || existingData.nama,
      lokasi || existingData.lokasi,
      jenis || existingData.jenis,
      instalasi || existingData.instalasi,
      garansi || existingData.garansi,
      remot || existingData.remot,
      status || existingData.status,
      device || existingData.device,
      sensor || existingData.sensor,
      pelanggan || existingData.pelanggan,
      pic || existingData.pic,
      email || existingData.email,
      i_alat, // Hanya filename atau null
      processedMaintenanceDate,
      processedMaintenanceInterval,
      processedIsMaintenanceActive,
      originalId,
    ]);

    res.json({
      id: sequentialId,
      originalId: originalId,
      nama: nama || existingData.nama,
      lokasi: lokasi || existingData.lokasi,
      jenis: jenis || existingData.jenis,
      instalasi: instalasi || existingData.instalasi,
      garansi: garansi || existingData.garansi,
      remot: remot || existingData.remot,
      status: status || existingData.status,
      device: device || existingData.device,
      sensor: sensor || existingData.sensor,
      pelanggan: pelanggan || existingData.pelanggan,
      pic: pic || existingData.pic,
      i_alat: i_alat || null, // Hanya filename
      maintenanceDate: processedMaintenanceDate,
      maintenanceInterval: processedMaintenanceInterval,
      isMaintenanceActive: Boolean(processedIsMaintenanceActive),
      message: "Alat berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Error updateAlat:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAlat = async (req, res) => {
  try {
    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // CORRECT mapping: sequential ID = alat.length - index
    // So to get index from sequential ID: index = alat.length - sequentialId
    // But array is 0-based, so: arrayIndex = (alat.length - sequentialId)
    const arrayIndex = allAlat.length - sequentialId;

    // Make sure arrayIndex is valid
    if (arrayIndex < 0 || arrayIndex >= allAlat.length) {
      return res.status(404).json({ message: "Index tidak valid" });
    }

    const originalId = allAlat[arrayIndex].id;

    await db.query("DELETE FROM m_alat WHERE id = ?", [originalId]);

    res.json({ message: "Alat berhasil dihapus" });
  } catch (error) {
    console.error("Error in deleteAlat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const stopMaintenance = async (req, res) => {
  try {
    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Fix mapping: sequential ID uses reverse logic (alat.length - index)
    // So we need reverse mapping: (alat.length - sequentialId)
    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;

    // Check if maintenance is already inactive to prevent unnecessary updates
    const [currentStatus] = await db.query(
      "SELECT is_maintenance_active FROM m_alat WHERE id = ?",
      [originalId],
    );

    if (currentStatus.length === 0) {
      return res
        .status(404)
        .json({ message: "Alat tidak ditemukan di database" });
    }

    if (!currentStatus[0].is_maintenance_active) {
      return res.json({
        message: "Maintenance sudah dalam keadaan tidak aktif",
        id: sequentialId,
        alreadyInactive: true,
      });
    }

    await db.query(
      "UPDATE m_alat SET is_maintenance_active = FALSE WHERE id = ?",
      [originalId],
    );

    res.json({
      message: "Maintenance berhasil dihentikan",
      id: sequentialId,
      originalId: originalId,
    });
  } catch (error) {
    // Send proper HTTP status based on error type
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res
        .status(500)
        .json({ message: "Database table error", error: error.message });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateMaintenanceSettings = async (req, res) => {
  try {
    const { maintenanceDate, maintenanceInterval, isMaintenanceActive } =
      req.body;

    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;

    // Convert boolean
    const processedIsMaintenanceActive =
      isMaintenanceActive === true ||
      isMaintenanceActive === "true" ||
      isMaintenanceActive === 1 ||
      isMaintenanceActive === "1"
        ? 1
        : 0;

    // FIXED: Query yang lebih sederhana
    const query = `
      UPDATE m_alat 
      SET 
        maintenance_date = ?, 
        maintenance_interval_days = ?, 
        is_maintenance_active = ? 
      WHERE id = ?
    `;

    const [result] = await db.query(query, [
      maintenanceDate,
      maintenanceInterval || 90,
      processedIsMaintenanceActive,
      originalId,
    ]);

    res.json({
      message: "Pengaturan maintenance berhasil diupdate",
      id: sequentialId,
      originalId: originalId,
      maintenanceDate,
      maintenanceInterval: maintenanceInterval || 90,
      isMaintenanceActive: Boolean(processedIsMaintenanceActive),
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error updating maintenance settings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const sequentialId = parseInt(req.params.id);

    // Get all equipment to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT * FROM m_alat ORDER BY id DESC");

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Fix mapping: sequential ID uses reverse logic (alat.length - index)
    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;
    const today = new Date().toISOString().split("T")[0];

    // Update maintenance date to today and mark as completed (inactive)
    await db.query(
      `UPDATE m_alat SET 
        maintenance_date = ?, 
        is_maintenance_active = 0
       WHERE id = ?`,
      [today, originalId],
    );
    res.json({
      message: "Maintenance berhasil diselesaikan dan dinonaktifkan",
      id: sequentialId,
      maintenanceDate: today,
      isMaintenanceActive: false,
    });
  } catch (error) {
    console.error("❌ Error in completeMaintenance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const testMaintenance = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT id, nama, maintenance_date, maintenance_interval_days, is_maintenance_active FROM m_alat WHERE id = 7",
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public method for QR code access - tidak perlu auth
const getPublicAlatById = async (req, res) => {
  try {
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({
        success: false,
        message: "Alat tidak ditemukan",
      });
    }

    // Fix mapping: sequential ID uses reverse logic (alat.length - index)
    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;

    const [alat] = await db.query("SELECT * FROM m_alat WHERE id = ?", [
      originalId,
    ]);

    if (alat.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alat tidak ditemukan",
      });
    }

    // Calculate maintenance status for public display
    const equipment = alat[0];
    let maintenanceStatus = "inactive";
    let nextMaintenanceDate = null;

    if (equipment.is_maintenance_active) {
      if (equipment.maintenance_date && equipment.maintenance_interval_days) {
        const lastMaintenanceDate = new Date(equipment.maintenance_date);
        const intervalDays =
          parseInt(equipment.maintenance_interval_days) || 90;

        nextMaintenanceDate = new Date(lastMaintenanceDate);
        nextMaintenanceDate.setDate(
          nextMaintenanceDate.getDate() + intervalDays,
        );

        maintenanceStatus = "active";
      }
    }

    // Create public-safe response with sequential ID
    const publicData = {
      id: sequentialId,
      nama: equipment.nama,
      lokasi: equipment.lokasi,
      jenis: equipment.jenis,
      status: equipment.status,
      device: equipment.device || null,
      sensor: equipment.sensor || null,
      maintenanceDate: equipment.maintenance_date,
      nextMaintenanceDate: nextMaintenanceDate
        ? nextMaintenanceDate.toISOString().split("T")[0]
        : null,
      maintenanceStatus,
      instalasi: equipment.instalasi,
      garansi: equipment.garansi,
      remot: equipment.remot,
      pelanggan: equipment.pelanggan,
      pic: equipment.pic,
    };

    res.json({
      success: true,
      data: publicData,
      message: "Data alat berhasil diambil",
    });
  } catch (error) {
    console.error("❌ Public QR: Error fetching equipment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllAlat,
  getAlatById,
  createAlat,
  updateAlat,
  deleteAlat,
  stopMaintenance,
  updateMaintenanceSettings,
  completeMaintenance,
  testMaintenance,
  getPublicAlatById,
};
