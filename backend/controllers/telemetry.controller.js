const { db } = require("../config/db.js");

const getAllTelemetry = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM m_telemetry ORDER BY id ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error("❌ Error getAllTelemetry:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getTelemetryById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID tidak valid" });
        }

        const [rows] = await db.query(
            "SELECT * FROM m_telemetry WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Jenis telemetry tidak ditemukan" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error getTelemetryById:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createTelemetry = async (req, res) => {
    try {
        const { id, jenis_telemetry } = req.body;

        if (!jenis_telemetry || !jenis_telemetry.trim()) {
            return res.status(400).json({ message: "jenis_telemetry wajib diisi" });
        }

        const [existing] = await db.query(
            "SELECT id FROM m_telemetry WHERE jenis_telemetry = ?",
            [jenis_telemetry.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "Jenis telemetry sudah ada" });
        }

        let query, params;

        if (id) {
            const [existingId] = await db.query(
                "SELECT id FROM m_telemetry WHERE id = ?",
                [id]
            );
            if (existingId.length > 0) {
                return res.status(409).json({ message: "ID sudah digunakan" });
            }
            query = "INSERT INTO m_telemetry (id, jenis_telemetry) VALUES (?, ?)";
            params = [id, jenis_telemetry.trim()];
        } else {
            const [maxRow] = await db.query("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM m_telemetry");
            const nextId = maxRow[0].next_id;
            query = "INSERT INTO m_telemetry (id, jenis_telemetry) VALUES (?, ?)";
            params = [nextId, jenis_telemetry.trim()];
        }

        const [result] = await db.query(query, params);

        res.status(201).json({
            message: "Jenis telemetry berhasil ditambahkan",
            data: {
                id: params[0],
                jenis_telemetry: params[1],
            },
        });
    } catch (error) {
        console.error("❌ Error createTelemetry:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateTelemetry = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { jenis_telemetry } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID tidak valid" });
        }

        if (!jenis_telemetry || !jenis_telemetry.trim()) {
            return res.status(400).json({ message: "jenis_telemetry wajib diisi" });
        }

        const [existing] = await db.query(
            "SELECT id FROM m_telemetry WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Jenis telemetry tidak ditemukan" });
        }

        const [duplicate] = await db.query(
            "SELECT id FROM m_telemetry WHERE jenis_telemetry = ? AND id != ?",
            [jenis_telemetry.trim(), id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({ message: "Jenis telemetry sudah ada" });
        }

        await db.query(
            "UPDATE m_telemetry SET jenis_telemetry = ? WHERE id = ?",
            [jenis_telemetry.trim(), id]
        );

        res.json({
            message: "Jenis telemetry berhasil diperbarui",
            data: {
                id,
                jenis_telemetry: jenis_telemetry.trim(),
            },
        });
    } catch (error) {
        console.error("❌ Error updateTelemetry:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteTelemetry = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID tidak valid" });
        }

        const [existing] = await db.query(
            "SELECT id, jenis_telemetry FROM m_telemetry WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Jenis telemetry tidak ditemukan" });
        }

        const [usedInAlat] = await db.query(
            "SELECT COUNT(*) AS total FROM m_alat WHERE jenis = ?",
            [existing[0].jenis_telemetry]
        );

        if (usedInAlat[0].total > 0) {
            return res.status(400).json({
                message: `Jenis telemetry tidak bisa dihapus karena masih digunakan oleh ${usedInAlat[0].total} alat`,
            });
        }

        await db.query("DELETE FROM m_telemetry WHERE id = ?", [id]);

        res.json({
            message: "Jenis telemetry berhasil dihapus",
            deletedId: id,
            deletedName: existing[0].jenis_telemetry,
        });
    } catch (error) {
        console.error("❌ Error deleteTelemetry:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllTelemetry,
    getTelemetryById,
    createTelemetry,
    updateTelemetry,
    deleteTelemetry,
};