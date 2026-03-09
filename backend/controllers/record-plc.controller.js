const { db } = require("../config/db.js");

// ─── PREVENTIVE ───────────────────────────────────────────────────────────────

const getAllRecordsPlc = async (req, res) => {
    try {
        const [records] = await db.query("SELECT * FROM m_record_plc");

        const processed = records.map((record) => ({
            ...record,
            i_alat: (() => {
                if (!record.i_alat) return null;
                try { return JSON.parse(record.i_alat); }
                catch { return [record.i_alat]; }
            })(),
        }));

        res.json(processed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getRecordPlcById = async (req, res) => {
    try {
        const [records] = await db.query("SELECT * FROM m_record_plc WHERE id = ?", [req.params.id]);
        if (records.length === 0) return res.status(404).json({ message: "Record tidak ditemukan" });

        const record = {
            ...records[0],
            i_alat: (() => {
                if (!records[0].i_alat) return null;
                try { return JSON.parse(records[0].i_alat); }
                catch { return [records[0].i_alat]; }
            })(),
        };

        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getRecordPlcByEquipmentId = async (req, res) => {
    try {
        const [records] = await db.query(
            "SELECT * FROM m_record_plc WHERE id_m_alat = ?",
            [req.params.id]
        );

        const parsed = records.map((row) => ({
            ...row,
            i_alat: (() => {
                if (!row.i_alat) return null;
                try { return JSON.parse(row.i_alat); }
                catch { return [row.i_alat]; }
            })(),
        }));

        res.json(parsed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const createRecordPlc = async (req, res) => {
    console.log("===== CREATE RECORD PLC DEBUG =====");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    try {
        const {
            deskripsi, awal, tindakan, tambahan, akhir,
            berikutnya, keterangan, petugas,
            i_panel, i_sensor,           // ✅ disimpan langsung dari body (bukan file)
            id_m_alat, tanggal,
        } = req.body;

        if (!id_m_alat || !tanggal || !deskripsi) {
            return res.status(400).json({ message: "id_m_alat, tanggal, dan deskripsi wajib diisi" });
        }

        // ✅ i_alat → upload file (array)
        let i_alat = null;
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map((f) => `/uploads/${f.filename}`);
            i_alat = JSON.stringify(filenames);
            console.log("✅ Files uploaded:", filenames);
        } else {
            console.log("⚠️ No files uploaded");
        }

        const [result] = await db.query(
            `INSERT INTO m_record_plc
            (deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas,
            i_panel, i_alat, i_sensor, id_m_alat, tanggal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                deskripsi, awal, tindakan, tambahan, akhir,
                berikutnya, keterangan, petugas,
                i_panel || null,
                i_alat,
                i_sensor || null,
                id_m_alat, tanggal,
            ]
        );

        res.status(201).json({
            id: result.insertId,
            ...req.body,
            i_alat: i_alat ? JSON.parse(i_alat) : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateRecordPlc = async (req, res) => {
    try {
        const {
            deskripsi, awal, tindakan, tambahan, akhir,
            berikutnya, keterangan, petugas,
            i_panel, i_alat, i_sensor,
            id_m_alat, tanggal,
        } = req.body;

        await db.query(
            `UPDATE m_record_plc SET
                deskripsi = ?, awal = ?, tindakan = ?, tambahan = ?, akhir = ?,
                berikutnya = ?, keterangan = ?, petugas = ?,
                i_panel = ?, i_alat = ?, i_sensor = ?,
                id_m_alat = ?, tanggal = ?
            WHERE id = ?`,
            [
                deskripsi, awal, tindakan, tambahan, akhir,
                berikutnya, keterangan, petugas,
                i_panel || null,
                i_alat || null,
                i_sensor || null,
                id_m_alat, tanggal,
                req.params.id,
            ]
        );

        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteRecordPlc = async (req, res) => {
    try {
        await db.query("DELETE FROM m_record_plc WHERE id = ?", [req.params.id]);
        res.json({ message: "Record PLC berhasil dihapus" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─── CORRECTIVE ───────────────────────────────────────────────────────────────

const getAllCorrectiveRecordsPlc = async (req, res) => {
    try {
        const [records] = await db.query("SELECT * FROM m_record_corrective_plc");

        const processed = records.map((record) => ({
            ...record,
            i_alat: (() => {
                if (!record.i_alat) return null;
                try { return JSON.parse(record.i_alat); }
                catch { return [record.i_alat]; }
            })(),
        }));

        res.json(processed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getCorrectiveRecordPlcById = async (req, res) => {
    try {
        const [records] = await db.query(
            "SELECT * FROM m_record_corrective_plc WHERE id = ?",
            [req.params.id]
        );
        if (records.length === 0) return res.status(404).json({ message: "Record tidak ditemukan" });

        const record = {
            ...records[0],
            i_alat: (() => {
                if (!records[0].i_alat) return null;
                try { return JSON.parse(records[0].i_alat); }
                catch { return [records[0].i_alat]; }
            })(),
        };

        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getCorrectiveRecordPlcByEquipmentId = async (req, res) => {
    try {
        const [records] = await db.query(
            "SELECT * FROM m_record_corrective_plc WHERE id_m_alat = ?",
            [req.params.id]
        );

        const parsed = records.map((row) => ({
            ...row,
            i_alat: (() => {
                if (!row.i_alat) return null;
                try { return JSON.parse(row.i_alat); }
                catch { return [row.i_alat]; }
            })(),
        }));

        res.json(parsed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const createCorrectiveRecordPlc = async (req, res) => {
    try {
        const {
            deskripsi, awal, tindakan, tambahan, akhir,
            berikutnya, keterangan, petugas,
            i_panel, i_sensor,           // ✅ dari body langsung
            id_m_alat, tanggal,
        } = req.body;

        if (!id_m_alat || !tanggal || !deskripsi) {
            return res.status(400).json({ message: "id_m_alat, tanggal, dan deskripsi wajib diisi" });
        }

        // ✅ i_alat → upload file (array)
        let i_alat = null;
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map((f) => `/uploads/${f.filename}`);
            i_alat = JSON.stringify(filenames);
            console.log("✅ Files uploaded:", filenames);
        }

        const [result] = await db.query(
            `INSERT INTO m_record_corrective_plc
            (deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas,
            i_panel, i_alat, i_sensor, id_m_alat, tanggal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                deskripsi, awal, tindakan, tambahan, akhir,
                berikutnya, keterangan, petugas,
                i_panel || null,
                i_alat,
                i_sensor || null,
                id_m_alat, tanggal,
            ]
        );

        res.status(201).json({
            id: result.insertId,
            ...req.body,
            i_alat: i_alat ? JSON.parse(i_alat) : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateCorrectiveRecordPlc = async (req, res) => {
    try {
        const {
            deskripsi, awal, tindakan, tambahan, akhir,
            berikutnya, keterangan, petugas,
            i_panel, i_alat, i_sensor,
            id_m_alat, tanggal,
        } = req.body;

        await db.query(
            `UPDATE m_record_corrective_plc SET
                deskripsi = ?, awal = ?, tindakan = ?, tambahan = ?, akhir = ?,
                berikutnya = ?, keterangan = ?, petugas = ?,
                i_panel = ?, i_alat = ?, i_sensor = ?,
                id_m_alat = ?, tanggal = ?
            WHERE id = ?`,
            [
                deskripsi, awal, tindakan, tambahan, akhir,
                berikutnya, keterangan, petugas,
                i_panel || null,
                i_alat || null,
                i_sensor || null,
                id_m_alat, tanggal,
                req.params.id,
            ]
        );

        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteCorrectiveRecordPlc = async (req, res) => {
    try {
        await db.query("DELETE FROM m_record_corrective_plc WHERE id = ?", [req.params.id]);
        res.json({ message: "Record corrective PLC berhasil dihapus" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    // Preventive
    getAllRecordsPlc,
    getRecordPlcById,
    getRecordPlcByEquipmentId,
    createRecordPlc,
    updateRecordPlc,
    deleteRecordPlc,
    // Corrective
    getAllCorrectiveRecordsPlc,
    getCorrectiveRecordPlcById,
    getCorrectiveRecordPlcByEquipmentId,
    createCorrectiveRecordPlc,
    updateCorrectiveRecordPlc,
    deleteCorrectiveRecordPlc,
};