const { db } = require("../config/db.js");

const getAllAlat = async (req, res) => {
  try {
    console.log("Starting getAllAlat request");
    // ORDER BY id DESC untuk menampilkan data terbaru (ID terbesar) di atas
    const [alat] = await db.query("SELECT * FROM m_alat ORDER BY id DESC");
    console.log("Database query completed, processing", alat.length, "items");

    // Calculate maintenance status for each equipment
    const alatWithSequentialId = alat.map((item, index) => {
      // Reverse sequential ID: data terbaru (index 0) mendapat ID terbesar
      // Jika total 9 data: index 0 = ID 9, index 1 = ID 8, ..., index 8 = ID 1
      const sequentialId = alat.length - index;
      console.log(
        `Mapping: DB ID ${item.id} -> Sequential ID ${sequentialId} (index: ${index})`
      );

      // Calculate maintenance status
      let maintenanceStatus = "inactive";
      let maintenanceAlertLevel = "none";
      let maintenanceDaysLeft = null;
      let nextMaintenanceDate = null;
      let maintenanceStatusText = "";

      // Check if maintenance is active and columns exist
      if (item.is_maintenance_active) {
        if (item.maintenance_date && item.maintenance_interval_days) {
          // Full maintenance calculation when both date and interval are available
          const today = new Date();
          const lastMaintenanceDate = new Date(item.maintenance_date);
          const intervalDays = parseInt(item.maintenance_interval_days) || 90;

          // Calculate next maintenance date
          nextMaintenanceDate = new Date(lastMaintenanceDate);
          nextMaintenanceDate.setDate(
            nextMaintenanceDate.getDate() + intervalDays
          );

          // Calculate days left
          const timeDiff = nextMaintenanceDate.getTime() - today.getTime();
          maintenanceDaysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // DEBUG LOGGING for specific equipment
          if (
            item.nama === "acafaaf" ||
            item.nama === "scsC" ||
            item.nama === "WQMS Sungai Progo Magelang"
          ) {
            console.log(`🔍 BACKEND DEBUG - ${item.nama}:`, {
              today: today.toISOString(),
              lastMaintenanceDate: lastMaintenanceDate.toISOString(),
              intervalDays,
              nextMaintenanceDate: nextMaintenanceDate.toISOString(),
              timeDiff,
              maintenanceDaysLeft,
              maintenanceDateRaw: item.maintenance_date,
              isMaintenanceActive: Boolean(item.is_maintenance_active),
            });
          }

          // Determine status and alert level
          if (maintenanceDaysLeft <= 0) {
            maintenanceStatus = "overdue";
            maintenanceAlertLevel = "red"; // Changed from "urgent" to "red"
            maintenanceStatusText = "Terlambat maintenance";
          } else if (maintenanceDaysLeft <= 14) {
            // Changed from 7 to 14 days to match frontend logic
            maintenanceStatus = "urgent";
            maintenanceAlertLevel = "red"; // Changed from "urgent" to "red"
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Urgent)`;
          } else if (maintenanceDaysLeft <= 30) {
            maintenanceStatus = "needed";
            maintenanceAlertLevel = "yellow"; // Changed from "warning" to "yellow"
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Diperlukan)`;
          } else {
            maintenanceStatus = "good";
            maintenanceAlertLevel = "green"; // Changed from "good" to "green"
            maintenanceStatusText = `${maintenanceDaysLeft} hari lagi`;
          }

          // ADDITIONAL DEBUG for problematic equipment
          if (
            item.nama === "acafaaf" ||
            item.nama === "scsC" ||
            item.nama === "WQMS Sungai Progo Magelang"
          ) {
            console.log(`🎯 BACKEND RESULT - ${item.nama}:`, {
              maintenanceDaysLeft,
              maintenanceStatus,
              maintenanceAlertLevel,
              maintenanceStatusText,
              logic: {
                isOverdue: maintenanceDaysLeft <= 0,
                isUrgent: maintenanceDaysLeft <= 14 && maintenanceDaysLeft > 0,
                isNeeded: maintenanceDaysLeft <= 30 && maintenanceDaysLeft > 14,
                isGood: maintenanceDaysLeft > 30,
              },
            });
          }
        } else {
          // Equipment has maintenance active but no date set - needs immediate attention
          maintenanceStatus = "needed";
          maintenanceAlertLevel = "yellow";
          maintenanceStatusText = "Maintenance belum dijadwalkan";
          maintenanceDaysLeft = null;
        }
      } else if (item.maintenance_date && item.maintenance_interval_days) {
        // Equipment is not currently under maintenance but has maintenance schedule
        // Still calculate maintenance intervals for display
        const today = new Date();
        const lastMaintenanceDate = new Date(item.maintenance_date);
        const intervalDays = parseInt(item.maintenance_interval_days) || 90;

        // Check if maintenance was completed today (show "selesai" status)
        const isSameDay =
          today.getFullYear() === lastMaintenanceDate.getFullYear() &&
          today.getMonth() === lastMaintenanceDate.getMonth() &&
          today.getDate() === lastMaintenanceDate.getDate();

        if (isSameDay) {
          maintenanceStatus = "selesai";
          maintenanceAlertLevel = "blue";
          maintenanceStatusText = "Maintenance selesai hari ini";
          console.log(
            `✅ MAINTENANCE COMPLETED TODAY for ${item.nama}: Setting status to 'selesai'`
          );
        } else {
          // Calculate next maintenance date for regular scheduling
          nextMaintenanceDate = new Date(lastMaintenanceDate);
          nextMaintenanceDate.setDate(
            nextMaintenanceDate.getDate() + intervalDays
          );

          // Calculate days left
          const timeDiff = nextMaintenanceDate.getTime() - today.getTime();
          maintenanceDaysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Determine status and alert level (same logic as active maintenance)
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
        // Equipment has no maintenance schedule or date - truly inactive
        maintenanceStatus = "inactive";
        maintenanceAlertLevel = "none";
        maintenanceStatusText = "Tidak ada jadwal maintenance";
      }

      return {
        id: sequentialId, // Simple sequential ID: 1, 2, 3, ...
        originalId: item.id, // Keep original DB ID for backend operations
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
        // Maintenance fields with calculated values
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

    console.log("Sending response with", alatWithSequentialId.length, "items");
    res.json(alatWithSequentialId);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAlatById = async (req, res) => {
  try {
    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    console.log(
      `🔍 getAlatById: Requested sequential ID ${sequentialId}, Total records: ${allAlat.length}`
    );

    // Enhanced validation
    if (isNaN(sequentialId) || sequentialId < 1) {
      console.log(`❌ getAlatById: Invalid sequential ID ${sequentialId}`);
      return res.status(400).json({ message: "ID tidak valid" });
    }

    if (sequentialId > allAlat.length) {
      console.log(
        `❌ getAlatById: Sequential ID ${sequentialId} out of range (max: ${allAlat.length})`
      );
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Reverse mapping: data terbaru (index 0) = ID tertinggi
    // Jika total 9 data: Sequential ID 9 = index 0, Sequential ID 1 = index 8
    const arrayIndex = allAlat.length - sequentialId;

    // Additional safety check
    if (arrayIndex < 0 || arrayIndex >= allAlat.length) {
      console.log(`❌ getAlatById: Array index ${arrayIndex} out of bounds`);
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const originalId = allAlat[arrayIndex].id;
    console.log(
      `✅ getAlatById: Sequential ID ${sequentialId} maps to original ID ${originalId}`
    );

    const [alat] = await db.query("SELECT * FROM m_alat WHERE id = ?", [
      originalId,
    ]);

    if (alat.length === 0) {
      console.log(
        `❌ getAlatById: No data found for original ID ${originalId}`
      );
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Add sequential ID to response
    const result = { ...alat[0], id: sequentialId, originalId: originalId };
    console.log(
      `✅ getAlatById: Successfully returned data for sequential ID ${sequentialId}`
    );
    res.json(result);
  } catch (error) {
    console.error("❌ getAlatById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAlat = async (req, res) => {
  try {
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

    console.log("Creating equipment with data:", req.body);

    // Handle file upload (auto-converted if HEIC)
    let i_alat = "";
    if (req.file) {
      i_alat = req.file.filename; // This is already the converted file if it was HEIC
      console.log("📁 File upload processed:", {
        filename: i_alat,
        originalFormat: req.file.originalFormat,
        autoConverted: req.file.autoConverted,
        size: (req.file.size / 1024).toFixed(2) + "KB",
      });

      if (req.file.autoConverted) {
        console.log(
          "✅ HEIC file was auto-converted to JPEG for browser compatibility"
        );
      }
    }

    // Set default maintenance values
    const maintenance_date = maintenanceDate
      ? new Date(maintenanceDate)
      : new Date();
    const maintenance_interval_days = maintenanceInterval || 90;
    const is_maintenance_active =
      isMaintenanceActive !== undefined ? Boolean(isMaintenanceActive) : true;

    const [result] = await db.query(
      `INSERT INTO m_alat 
       (nama, lokasi, jenis, instalasi, garansi, remot, status, device, sensor, pelanggan, pic, email, i_alat, maintenance_date, maintenance_interval_days, is_maintenance_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama,
        lokasi,
        jenis,
        instalasi,
        garansi,
        remot || "off",
        status,
        device,
        sensor,
        pelanggan,
        pic,
        email || null,
        i_alat, // Use converted file (JPEG if originally HEIC)
        maintenance_date,
        maintenance_interval_days,
        is_maintenance_active,
      ]
    );

    res.status(201).json({
      id: result.insertId,
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
      i_alat,
      maintenanceDate: maintenance_date,
      maintenanceInterval: maintenance_interval_days,
      isMaintenanceActive: is_maintenance_active,
    });
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAlat = async (req, res) => {
  try {
    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    console.log(
      `🔍 updateAlat: Requested sequential ID ${sequentialId}, Total records: ${allAlat.length}`
    );

    // Enhanced validation
    if (isNaN(sequentialId) || sequentialId < 1) {
      console.log(`❌ updateAlat: Invalid sequential ID ${sequentialId}`);
      return res.status(400).json({ message: "ID tidak valid" });
    }

    if (sequentialId > allAlat.length) {
      console.log(
        `❌ updateAlat: Sequential ID ${sequentialId} out of range (max: ${allAlat.length})`
      );
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Reverse mapping: data terbaru (index 0) = ID tertinggi
    // Jika total 9 data: Sequential ID 9 = index 0, Sequential ID 1 = index 8
    const arrayIndex = allAlat.length - sequentialId;

    // Additional safety check
    if (arrayIndex < 0 || arrayIndex >= allAlat.length) {
      console.log(`❌ updateAlat: Array index ${arrayIndex} out of bounds`);
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    const originalId = allAlat[arrayIndex].id;
    console.log(
      `✅ updateAlat: Sequential ID ${sequentialId} maps to original ID ${originalId}`
    );

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

    console.log("Updating equipment with maintenance data:", {
      maintenanceDate,
      maintenanceInterval,
      isMaintenanceActive,
      "typeof isMaintenanceActive": typeof isMaintenanceActive,
    });

    // Handle file upload (auto-converted if HEIC)
    let i_alat = req.body.i_alat || "";
    if (req.file) {
      i_alat = req.file.filename; // This is already the converted file if it was HEIC
      console.log("📁 File update processed:", {
        filename: i_alat,
        originalFormat: req.file.originalFormat,
        autoConverted: req.file.autoConverted,
        size: (req.file.size / 1024).toFixed(2) + "KB",
      });

      if (req.file.autoConverted) {
        console.log(
          "✅ HEIC file was auto-converted to JPEG for browser compatibility"
        );
      }
    }

    // Convert maintenance values
    const processedMaintenanceDate =
      maintenanceDate && maintenanceDate !== "" ? maintenanceDate : null;
    const processedMaintenanceInterval = parseInt(maintenanceInterval) || 90;
    const processedIsMaintenanceActive =
      isMaintenanceActive === true ||
      isMaintenanceActive === "true" ||
      isMaintenanceActive === 1
        ? 1
        : 0;

    console.log("Processed maintenance values for update:", {
      processedMaintenanceDate,
      processedMaintenanceInterval,
      processedIsMaintenanceActive,
    });

    await db.query(
      `UPDATE m_alat SET 
       nama = ?, lokasi = ?, jenis = ?, instalasi = ?, garansi = ?, remot = ?, status = ?, device = ?, sensor = ?, pelanggan = ?, pic = ?, email = ?, i_alat = ?,
       maintenance_date = ?, maintenance_interval_days = ?, is_maintenance_active = ?
       WHERE id = ?`,
      [
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
        email || null,
        i_alat,
        processedMaintenanceDate,
        processedMaintenanceInterval,
        processedIsMaintenanceActive,
        originalId,
      ]
    );

    res.json({
      id: sequentialId, // Return sequential ID for frontend consistency
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
      i_alat,
      maintenanceDate: processedMaintenanceDate,
      maintenanceInterval: processedMaintenanceInterval,
      isMaintenanceActive: processedIsMaintenanceActive,
    });

    console.log(
      `✅ updateAlat: Successfully updated equipment sequential ID ${sequentialId} (original ID ${originalId})`
    );
  } catch (error) {
    console.error("❌ updateAlat error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

    console.log(`🗑️ DELETE MAPPING DEBUG:`, {
      sequentialId,
      arrayIndex,
      originalId,
      totalItems: allAlat.length,
      allAlatIds: allAlat.map((a) => a.id),
    });

    await db.query("DELETE FROM m_alat WHERE id = ?", [originalId]);

    res.json({ message: "Alat berhasil dihapus" });
  } catch (error) {
    console.error("Error in deleteAlat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const stopMaintenance = async (req, res) => {
  try {
    console.log(
      `🛑 Stop maintenance request for sequential ID: ${req.params.id}`
    );

    // Get all data first to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT id FROM m_alat ORDER BY id DESC");
    const sequentialId = parseInt(req.params.id);

    console.log(
      `📊 Total equipment: ${allAlat.length}, Sequential ID requested: ${sequentialId}`
    );

    if (sequentialId > allAlat.length || sequentialId < 1) {
      console.log(`❌ Invalid sequential ID: ${sequentialId}`);
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Fix mapping: sequential ID uses reverse logic (alat.length - index)
    // So we need reverse mapping: (alat.length - sequentialId)
    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;

    console.log(
      `🔄 Mapping: Sequential ID ${sequentialId} → Array Index ${arrayIndex} → Original ID ${originalId}`
    );

    // Check if maintenance is already inactive to prevent unnecessary updates
    const [currentStatus] = await db.query(
      "SELECT is_maintenance_active FROM m_alat WHERE id = ?",
      [originalId]
    );

    if (currentStatus.length === 0) {
      console.log(
        `❌ Equipment not found in database with original ID: ${originalId}`
      );
      return res
        .status(404)
        .json({ message: "Alat tidak ditemukan di database" });
    }

    if (!currentStatus[0].is_maintenance_active) {
      console.log(`ℹ️ Maintenance already inactive for ID ${originalId}`);
      return res.json({
        message: "Maintenance sudah dalam keadaan tidak aktif",
        id: sequentialId,
        alreadyInactive: true,
      });
    }

    await db.query(
      "UPDATE m_alat SET is_maintenance_active = FALSE WHERE id = ?",
      [originalId]
    );

    console.log(
      `✅ Maintenance stopped successfully for original ID: ${originalId}`
    );

    res.json({
      message: "Maintenance berhasil dihentikan",
      id: sequentialId,
      originalId: originalId,
    });
  } catch (error) {
    console.error("❌ Error in stopMaintenance:", error);

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

    // Fix mapping: sequential ID uses reverse logic (alat.length - index)
    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;

    await db.query(
      `UPDATE m_alat SET 
        maintenance_date = ?, 
        maintenance_interval_days = ?, 
        is_maintenance_active = ? 
       WHERE id = ?`,
      [
        maintenanceDate,
        maintenanceInterval || 90,
        isMaintenanceActive,
        originalId,
      ]
    );

    res.json({
      message: "Pengaturan maintenance berhasil diupdate",
      id: sequentialId,
      maintenanceDate,
      maintenanceInterval: maintenanceInterval || 90,
      isMaintenanceActive,
    });
  } catch (error) {
    console.error("❌ Error in updateMaintenanceSettings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const sequentialId = parseInt(req.params.id);
    console.log(`🔧 Completing maintenance for equipment ID: ${sequentialId}`);

    // Get all equipment to map sequential ID to original ID
    const [allAlat] = await db.query("SELECT * FROM m_alat ORDER BY id DESC");

    if (sequentialId > allAlat.length || sequentialId < 1) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    // Fix mapping: sequential ID uses reverse logic (alat.length - index)
    const arrayIndex = allAlat.length - sequentialId;
    const originalId = allAlat[arrayIndex].id;
    const today = new Date().toISOString().split("T")[0];

    console.log(`🗂️ COMPLETE MAINTENANCE MAPPING:`, {
      sequentialId,
      arrayIndex,
      originalId,
      totalItems: allAlat.length,
    });

    // Update maintenance date to today and mark as completed (inactive)
    await db.query(
      `UPDATE m_alat SET 
        maintenance_date = ?, 
        is_maintenance_active = 0
       WHERE id = ?`,
      [today, originalId]
    );

    console.log(
      `✅ Maintenance completed and deactivated for equipment ID ${sequentialId} (original ID: ${originalId})`
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
    console.log("Testing maintenance data...");
    const [result] = await db.query(
      "SELECT id, nama, maintenance_date, maintenance_interval_days, is_maintenance_active FROM m_alat WHERE id = 7"
    );
    console.log("Raw result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error in testMaintenance:", error);
    res.status(500).json({ error: error.message });
  }
};

// Public method for QR code access - tidak perlu auth
const getPublicAlatById = async (req, res) => {
  try {
    console.log("🔍 Public QR: Getting equipment data for ID:", req.params.id);

    // Get all data first to map sequential ID to original ID
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
          nextMaintenanceDate.getDate() + intervalDays
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

    console.log("✅ Public QR: Equipment data sent successfully");

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
