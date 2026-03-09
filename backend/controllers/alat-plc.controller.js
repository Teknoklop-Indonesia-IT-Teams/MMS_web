const { db } = require("../config/db.js");

// ─── Helper: parse maintenance active value ───────────────────────────────────

const parseMaintenanceActive = (value) => {
    if (value === false || value === 0 || value === "0" || String(value).toLowerCase() === "false") return false;
    if (value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true") return true;
    return null;
};

// ─── Helper: hitung maintenance status ───────────────────────────────────────

const calcMaintenanceStatus = (item, maintenanceDate, hasValidDate, isMaintenanceActiveFromDB) => {
    const today = new Date();

    const maintenanceEnabled = isMaintenanceActiveFromDB === null
        ? hasValidDate
        : isMaintenanceActiveFromDB && hasValidDate;

    let maintenanceStatus = "inactive";
    let maintenanceAlertLevel = "none";
    let maintenanceDaysLeft = null;
    let nextMaintenanceDate = null;
    let maintenanceStatusText = "Tidak ada jadwal maintenance";

    if (!maintenanceEnabled) {
        if (isMaintenanceActiveFromDB === false) {
            maintenanceStatus = "selesai";
            maintenanceAlertLevel = "blue";
            maintenanceStatusText = "Maintenance selesai";
        }
    } else {
        const intervalDays = parseInt(item.maintenance_interval_days) || 90;
        nextMaintenanceDate = new Date(maintenanceDate);
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + intervalDays);

        const timeDiff = nextMaintenanceDate.getTime() - today.getTime();
        maintenanceDaysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (maintenanceDaysLeft < 0) {
            maintenanceStatus = "overdue"; maintenanceAlertLevel = "red"; maintenanceStatusText = "Terlambat maintenance";
        } else if (maintenanceDaysLeft <= 7) {
            maintenanceStatus = "urgent"; maintenanceAlertLevel = "red"; maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Urgent)`;
        } else if (maintenanceDaysLeft <= 30) {
            maintenanceStatus = "warning"; maintenanceAlertLevel = "yellow"; maintenanceStatusText = `${maintenanceDaysLeft} hari lagi (Diperlukan)`;
        } else {
            maintenanceStatus = "good"; maintenanceAlertLevel = "green"; maintenanceStatusText = `${maintenanceDaysLeft} hari lagi`;
        }
    }

    return {
        maintenanceEnabled,
        maintenanceStatus,
        maintenanceAlertLevel,
        maintenanceDaysLeft,
        maintenanceStatusText,
        nextMaintenanceDate: nextMaintenanceDate ? nextMaintenanceDate.toISOString().split("T")[0] : null,
    };
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────

const getAllAlatPlc = async (req, res) => {
    try {
        console.log("🔍 Executing getAllAlatPlc query...");

        // ✅ JOIN ke m_plc untuk ambil nama jenis
        const [alat] = await db.query(`
        SELECT 
            a.*,
            p.jenis_plc AS jenis_nama,
            r.latest_tanggal
        FROM m_alat_plc a
        LEFT JOIN m_plc p ON a.jenis = p.id
        LEFT JOIN (
            SELECT id_m_alat, MAX(tanggal) AS latest_tanggal
            FROM m_record_plc
            GROUP BY id_m_alat
        ) r ON a.id = r.id_m_alat
        ORDER BY a.id DESC
    `);

        console.log(`📊 Found ${alat.length} PLC equipment records`);

        const result = alat.map((item, index) => {
            const sequentialId = alat.length - index;

            let maintenanceDate = null;
            let hasValidDate = false;
            let dateSource = "none";

            if (item.latest_tanggal) {
                const d = new Date(item.latest_tanggal);
                if (!isNaN(d.getTime())) { maintenanceDate = d; hasValidDate = true; dateSource = "record"; }
            }

            if (!hasValidDate && item.instalasi) {
                const d = new Date(item.instalasi);
                if (!isNaN(d.getTime())) { maintenanceDate = d; hasValidDate = true; dateSource = "instalasi"; }
            }

            const isMaintenanceActiveFromDB = parseMaintenanceActive(item.is_maintenance_active);
            const maintenance = calcMaintenanceStatus(item, maintenanceDate, hasValidDate, isMaintenanceActiveFromDB);
            const { latest_tanggal, jenis_nama, ...itemData } = item;

            return {
                id: item.id,
                displayId: sequentialId,
                originalId: item.id,
                nama: itemData.nama || "",
                lokasi: itemData.lokasi || "",
                jenis: jenis_nama || "",          // ✅ nama jenis dari JOIN
                jenisId: itemData.jenis || null,  // ✅ ID tetap dikirim juga
                instalasi: itemData.instalasi || "",
                garansi: itemData.garansi || "",
                remot: itemData.remot || "",
                status: itemData.status || "",
                device: itemData.device || "",
                sensor: itemData.sensor || "",
                pelanggan: itemData.pelanggan || "",
                pic: itemData.pic || "",
                email: itemData.email || "",
                i_alat: itemData.i_alat || "",
                maintenanceDate: hasValidDate ? maintenanceDate.toISOString().split("T")[0] : null,
                maintenanceInterval: itemData.maintenance_interval_days || 90,
                hasValidDate,
                isMaintenanceActive: isMaintenanceActiveFromDB,
                maintenanceEnabled: maintenance.maintenanceEnabled,
                maintenanceStatus: maintenance.maintenanceStatus,
                maintenanceAlertLevel: maintenance.maintenanceAlertLevel,
                maintenanceDaysLeft: maintenance.maintenanceDaysLeft,
                maintenanceStatusText: maintenance.maintenanceStatusText,
                nextMaintenanceDate: maintenance.nextMaintenanceDate,
                dateSource,
            };
        });

        res.json(result);
    } catch (error) {
        console.error("❌ Error in getAllAlatPlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

const getAlatPlcById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const [rows] = await db.query(`
        SELECT a.*, p.jenis_plc AS jenis_nama
        FROM m_alat_plc a
        LEFT JOIN m_plc p ON a.jenis = p.id
        WHERE a.id = ?
    `, [id]);

        if (rows.length === 0) return res.status(404).json({ message: "Alat tidak ditemukan" });

        const item = rows[0];
        res.json({ ...item, jenis: item.jenis_nama || "", jenisId: item.jenis });
    } catch (error) {
        console.error("❌ getAlatPlcById error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

const createAlatPlc = async (req, res) => {
    try {
        console.log("\n========== CREATE ALAT PLC START ==========");

        const {
            nama, lokasi, jenis, instalasi, garansi, remot, status,
            device, sensor, pelanggan, pic, email,
            maintenanceDate, maintenanceInterval, isMaintenanceActive,
        } = req.body;

        if (!nama || !lokasi || !jenis) {
            return res.status(400).json({ message: "Nama, lokasi, dan jenis wajib diisi" });
        }

        // ✅ jenis adalah ID integer (FK ke m_plc)
        const jenisId = parseInt(jenis);
        if (isNaN(jenisId)) return res.status(400).json({ message: "Jenis tidak valid" });

        // Validasi jenis ada di m_plc
        const [plcCheck] = await db.query("SELECT id FROM m_plc WHERE id = ?", [jenisId]);
        if (plcCheck.length === 0) return res.status(400).json({ message: "Jenis PLC tidak ditemukan" });

        let i_alat = null;
        if (req.file) {
            i_alat = req.file.filename;
            console.log("✅ File uploaded:", i_alat);
        }

        const is_maintenance_active = ["true", true, 1, "1"].includes(isMaintenanceActive) ? 1 : 0;

        const [result] = await db.query(`
        INSERT INTO m_alat_plc (
            nama, lokasi, jenis, instalasi, garansi, remot, status,
            device, sensor, pelanggan, pic, email, i_alat,
            maintenance_date, maintenance_interval_days, is_maintenance_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            nama, lokasi, jenisId,
            instalasi || null, garansi || null,
            remot || "off", status || "Garansi",
            device || null, sensor || null,
            pelanggan || null, pic || null, email || null,
            i_alat,
            maintenanceDate || new Date().toISOString().split("T")[0],
            maintenanceInterval || 90,
            is_maintenance_active,
        ]);

        // Ambil nama jenis untuk response
        const [plcRow] = await db.query("SELECT jenis_plc FROM m_plc WHERE id = ?", [jenisId]);

        res.status(201).json({
            id: result.insertId,
            nama, lokasi,
            jenis: plcRow[0]?.jenis_plc || "",
            jenisId,
            instalasi: instalasi || null,
            garansi: garansi || null,
            remot: remot || "off",
            status: status || "Garansi",
            device: device || null,
            sensor: sensor || null,
            pelanggan: pelanggan || null,
            pic: pic || null,
            email: email || null,
            i_alat,
            maintenanceDate: maintenanceDate || new Date().toISOString().split("T")[0],
            maintenanceInterval: maintenanceInterval || 90,
            isMaintenanceActive: Boolean(is_maintenance_active),
            message: "Alat PLC berhasil ditambahkan",
        });
    } catch (error) {
        console.error("❌ CREATE ALAT PLC ERROR:", error);
        res.status(500).json({ message: "Server error", error: error.message, sqlError: error.sqlMessage });
    }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

const updateAlatPlc = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const [existing] = await db.query("SELECT * FROM m_alat_plc WHERE id = ?", [id]);
        if (existing.length === 0) return res.status(404).json({ message: "Alat tidak ditemukan" });

        const existingData = existing[0];

        const {
            nama, lokasi, jenis, instalasi, garansi, remot, status,
            device, sensor, pelanggan, pic, email,
            maintenanceDate, maintenanceInterval, isMaintenanceActive,
        } = req.body;

        // ✅ Resolve jenis ID
        let jenisId = existingData.jenis;
        if (jenis !== undefined) {
            jenisId = parseInt(jenis);
            if (isNaN(jenisId)) return res.status(400).json({ message: "Jenis tidak valid" });
            const [plcCheck] = await db.query("SELECT id FROM m_plc WHERE id = ?", [jenisId]);
            if (plcCheck.length === 0) return res.status(400).json({ message: "Jenis PLC tidak ditemukan" });
        }

        let i_alat = existingData.i_alat;
        if (req.file) {
            i_alat = req.file.filename;
        } else if (req.body.removeImage === "true") {
            i_alat = null;
        }

        const formatDate = (d) => {
            if (!d || d === "") return null;
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
            return d.split("T")[0];
        };

        const processedInstalasi = formatDate(instalasi) || existingData.instalasi;
        const processedGaransi = formatDate(garansi) || existingData.garansi;
        const processedMaintenanceDate = formatDate(maintenanceDate) || existingData.maintenance_date;
        const processedMaintenanceInterval = parseInt(maintenanceInterval) || existingData.maintenance_interval_days || 90;
        const processedIsMaintenanceActive = isMaintenanceActive !== undefined
            ? (["true", true, 1, "1"].includes(isMaintenanceActive) ? 1 : 0)
            : existingData.is_maintenance_active;

        await db.query(`
        UPDATE m_alat_plc SET
            nama = ?, lokasi = ?, jenis = ?,
            instalasi = ?, garansi = ?, remot = ?,
            status = ?, device = ?, sensor = ?,
            pelanggan = ?, pic = ?, email = ?,
            i_alat = ?, maintenance_date = ?,
            maintenance_interval_days = ?, is_maintenance_active = ?
        WHERE id = ?
    `, [
            nama || existingData.nama,
            lokasi || existingData.lokasi,
            jenisId,
            processedInstalasi, processedGaransi,
            remot || existingData.remot,
            status || existingData.status,
            device || existingData.device,
            sensor || existingData.sensor,
            pelanggan || existingData.pelanggan,
            pic || existingData.pic,
            email || existingData.email,
            i_alat,
            processedMaintenanceDate,
            processedMaintenanceInterval,
            processedIsMaintenanceActive,
            id,
        ]);

        const [plcRow] = await db.query("SELECT jenis_plc FROM m_plc WHERE id = ?", [jenisId]);

        res.json({
            success: true,
            id,
            nama: nama || existingData.nama,
            lokasi: lokasi || existingData.lokasi,
            jenis: plcRow[0]?.jenis_plc || "",
            jenisId,
            instalasi: processedInstalasi,
            garansi: processedGaransi,
            remot: remot || existingData.remot,
            status: status || existingData.status,
            device: device || existingData.device,
            sensor: sensor || existingData.sensor,
            pelanggan: pelanggan || existingData.pelanggan,
            pic: pic || existingData.pic,
            i_alat,
            maintenanceDate: processedMaintenanceDate,
            maintenanceInterval: processedMaintenanceInterval,
            isMaintenanceActive: Boolean(processedIsMaintenanceActive),
            message: "Alat PLC berhasil diperbarui",
        });
    } catch (error) {
        console.error("❌ Error updateAlatPlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

const deleteAlatPlc = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const id = parseInt(req.params.id);
        const [check] = await connection.query("SELECT id, nama FROM m_alat_plc WHERE id = ?", [id]);
        if (check.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Alat tidak ditemukan" });
        }

        const [delRecord] = await connection.query("DELETE FROM m_record_plc WHERE id_m_alat = ?", [id]);
        const [delCorrective] = await connection.query("DELETE FROM m_record_corrective_plc WHERE id_m_alat = ?", [id]);
        await connection.query("DELETE FROM m_alat_plc WHERE id = ?", [id]);

        await connection.commit();

        res.json({
            message: "Alat PLC dan record terkait berhasil dihapus",
            deletedId: id,
            deletedRecords: delRecord.affectedRows,
            deletedCorrectiveRecords: delCorrective.affectedRows,
        });
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error deleteAlatPlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    } finally {
        connection.release();
    }
};

// ─── MAINTENANCE ──────────────────────────────────────────────────────────────

const updateMaintenanceSettingsPlc = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const { maintenanceDate, maintenanceInterval, isMaintenanceActive } = req.body;

        const [alat] = await db.query("SELECT id FROM m_alat_plc WHERE id = ?", [id]);
        if (alat.length === 0) return res.status(404).json({ message: "Alat tidak ditemukan" });

        const processedIsMaintenanceActive = ["true", true, 1, "1"].includes(isMaintenanceActive) ? 1 : 0;

        await db.query(`
        UPDATE m_alat_plc SET
        maintenance_date = ?, maintenance_interval_days = ?, is_maintenance_active = ?
        WHERE id = ?
    `, [maintenanceDate, maintenanceInterval || 90, processedIsMaintenanceActive, id]);

        res.json({
            message: "Pengaturan maintenance PLC berhasil diupdate",
            id, maintenanceDate,
            maintenanceInterval: maintenanceInterval || 90,
            isMaintenanceActive: Boolean(processedIsMaintenanceActive),
        });
    } catch (error) {
        console.error("❌ Error updateMaintenanceSettingsPlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const completeMaintenancePlc = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await db.query("SELECT * FROM m_alat_plc WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Alat tidak ditemukan" });

        const equipment = rows[0];
        const isActive = ["true", true, 1, "1"].includes(equipment.is_maintenance_active);
        if (!isActive) return res.status(400).json({ message: "Maintenance tidak aktif" });

        const today = new Date().toISOString().slice(0, 10);
        await db.query("UPDATE m_alat_plc SET maintenance_date = ?, is_maintenance_active = 'false' WHERE id = ?", [today, id]);

        res.json({ message: "Maintenance PLC berhasil diselesaikan", id, maintenanceDate: today, isMaintenanceActive: 0 });
    } catch (error) {
        console.error("❌ completeMaintenancePlc error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAlatPlcWithMaintenanceStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const [rows] = await db.query(`
        SELECT a.*, p.jenis_plc AS jenis_nama
        FROM m_alat_plc a
        LEFT JOIN m_plc p ON a.jenis = p.id
        WHERE a.id = ?
    `, [id]);

        if (rows.length === 0) return res.status(404).json({ message: "Alat tidak ditemukan" });

        const alat = rows[0];

        const [latestRecord] = await db.query(
            "SELECT tanggal FROM m_record_plc WHERE id_m_alat = ? ORDER BY tanggal DESC LIMIT 1",
            [id]
        );

        let maintenanceDate = null;
        let hasValidDate = false;
        let dateSource = "none";

        if (latestRecord.length > 0) {
            const d = new Date(latestRecord[0].tanggal);
            if (!isNaN(d.getTime())) { maintenanceDate = d; hasValidDate = true; dateSource = "record"; }
        }

        if (!hasValidDate && alat.instalasi) {
            const d = new Date(alat.instalasi);
            if (!isNaN(d.getTime())) { maintenanceDate = d; hasValidDate = true; dateSource = "instalasi"; }
        }

        const isMaintenanceActiveFromDB = parseMaintenanceActive(alat.is_maintenance_active);
        const maintenance = calcMaintenanceStatus(alat, maintenanceDate, hasValidDate, isMaintenanceActiveFromDB);

        res.json({
            ...alat,
            jenis: alat.jenis_nama || "",
            jenisId: alat.jenis,
            maintenanceDate: hasValidDate ? maintenanceDate.toISOString().split("T")[0] : null,
            nextMaintenanceDate: maintenance.nextMaintenanceDate,
            maintenanceDaysLeft: maintenance.maintenanceDaysLeft || 0,
            maintenanceStatus: maintenance.maintenanceStatus,
            maintenanceStatusText: maintenance.maintenanceStatusText,
            isMaintenanceActive: isMaintenanceActiveFromDB,
            maintenanceInterval: alat.maintenance_interval_days || 90,
            dateSource,
        });
    } catch (error) {
        console.error("❌ getAlatPlcWithMaintenanceStatus error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllAlatPlc,
    getAlatPlcById,
    createAlatPlc,
    updateAlatPlc,
    deleteAlatPlc,
    updateMaintenanceSettingsPlc,
    completeMaintenancePlc,
    getAlatPlcWithMaintenanceStatus,
};