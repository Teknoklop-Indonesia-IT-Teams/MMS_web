const { db } = require("../config/db.js");

const getAllPlc = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM m_plc ORDER BY id ASC");
        res.json(rows);
    } catch (error) {
        console.error("❌ Error getAllPlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getPlcById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const [rows] = await db.query("SELECT * FROM m_plc WHERE id = ?", [id]);
        if (rows.length === 0)
            return res.status(404).json({ message: "Jenis PLC tidak ditemukan" });

        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error getPlcById:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createPlc = async (req, res) => {
    try {
        const { id, jenis_plc } = req.body;

        if (!jenis_plc || !jenis_plc.trim())
            return res.status(400).json({ message: "jenis_plc wajib diisi" });

        const [existing] = await db.query(
            "SELECT id FROM m_plc WHERE jenis_plc = ?",
            [jenis_plc.trim()]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: "Jenis PLC sudah ada" });

        let insertId;
        if (id) {
            const [existingId] = await db.query("SELECT id FROM m_plc WHERE id = ?", [id]);
            if (existingId.length > 0)
                return res.status(409).json({ message: "ID sudah digunakan" });
            insertId = id;
        } else {
            const [maxRow] = await db.query(
                "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM m_plc"
            );
            insertId = maxRow[0].next_id;
        }

        await db.query("INSERT INTO m_plc (id, jenis_plc) VALUES (?, ?)", [
            insertId,
            jenis_plc.trim(),
        ]);

        res.status(201).json({
            message: "Jenis PLC berhasil ditambahkan",
            data: { id: insertId, jenis_plc: jenis_plc.trim() },
        });
    } catch (error) {
        console.error("❌ Error createPlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updatePlc = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { jenis_plc } = req.body;

        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
        if (!jenis_plc || !jenis_plc.trim())
            return res.status(400).json({ message: "jenis_plc wajib diisi" });

        const [existing] = await db.query("SELECT id FROM m_plc WHERE id = ?", [id]);
        if (existing.length === 0)
            return res.status(404).json({ message: "Jenis PLC tidak ditemukan" });

        const [duplicate] = await db.query(
            "SELECT id FROM m_plc WHERE jenis_plc = ? AND id != ?",
            [jenis_plc.trim(), id]
        );
        if (duplicate.length > 0)
            return res.status(409).json({ message: "Jenis PLC sudah ada" });

        await db.query("UPDATE m_plc SET jenis_plc = ? WHERE id = ?", [
            jenis_plc.trim(),
            id,
        ]);

        res.json({
            message: "Jenis PLC berhasil diperbarui",
            data: { id, jenis_plc: jenis_plc.trim() },
        });
    } catch (error) {
        console.error("❌ Error updatePlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deletePlc = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const [existing] = await db.query(
            "SELECT id, jenis_plc FROM m_plc WHERE id = ?",
            [id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: "Jenis PLC tidak ditemukan" });

        await db.query("DELETE FROM m_plc WHERE id = ?", [id]);

        res.json({
            message: "Jenis PLC berhasil dihapus",
            deletedId: id,
            deletedName: existing[0].jenis_plc,
        });
    } catch (error) {
        console.error("❌ Error deletePlc:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getAllPlc, getPlcById, createPlc, updatePlc, deletePlc };