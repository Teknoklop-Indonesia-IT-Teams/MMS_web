const { db } = require("../config/db.js");

const getAllClient = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM m_client WHERE status_delete = FALSE ORDER BY id ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error("❌ Error getAllClient:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getClientById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const [rows] = await db.query("SELECT * FROM m_client WHERE id = ?", [id]);
        if (rows.length === 0)
            return res.status(404).json({ message: "Client tidak ditemukan" });

        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error getClientById:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createClient = async (req, res) => {
    try {
        const { id, nama_client } = req.body;

        if (!nama_client || !nama_client.trim())
            return res.status(400).json({ message: "nama_client wajib diisi" });

        const [existing] = await db.query(
            "SELECT id FROM m_client WHERE nama_client = ?",
            [nama_client.trim()]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: "Client sudah ada" });

        let insertId;
        if (id) {
            const [existingId] = await db.query("SELECT id FROM m_client WHERE id = ?", [id]);
            if (existingId.length > 0)
                return res.status(409).json({ message: "ID sudah digunakan" });
            insertId = id;
        } else {
            const [maxRow] = await db.query(
                "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM m_client"
            );
            insertId = maxRow[0].next_id;
        }

        await db.query("INSERT INTO m_client (id, nama_client) VALUES (?, ?)", [
            insertId,
            nama_client.trim(),
        ]);

        res.status(201).json({
            message: "Client berhasil ditambahkan",
            data: { id: insertId, nama_client: nama_client.trim() },
        });
    } catch (error) {
        console.error("❌ Error createClient:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateClient = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nama_client } = req.body;

        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
        if (!nama_client || !nama_client.trim())
            return res.status(400).json({ message: "nama_client wajib diisi" });

        const [existing] = await db.query("SELECT id FROM m_client WHERE id = ?", [id]);
        if (existing.length === 0)
            return res.status(404).json({ message: "Client tidak ditemukan" });

        const [duplicate] = await db.query(
            "SELECT id FROM m_client WHERE nama_client = ? AND id != ?",
            [nama_client.trim(), id]
        );
        if (duplicate.length > 0)
            return res.status(409).json({ message: "Client sudah ada" });

        await db.query("UPDATE m_client SET nama_client = ? WHERE id = ?", [
            nama_client.trim(),
            id,
        ]);

        res.json({
            message: "Client berhasil diperbarui",
            data: { id, nama_client: nama_client.trim() },
        });
    } catch (error) {
        console.error("❌ Error updateClient:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

        const [existing] = await db.query(
            "SELECT id, nama_client FROM m_client WHERE id = ?",
            [id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: "Client tidak ditemukan" });

        await db.query("UPDATE m_client SET status_delete = TRUE WHERE id = ?", [id]);

        res.json({
            message: "Client berhasil dihapus",
            deletedId: id,
            deletedName: existing[0].nama_client,
        });
    } catch (error) {
        console.error("❌ Error deleteClient:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getAllClient, getClientById, createClient, updateClient, deleteClient };
