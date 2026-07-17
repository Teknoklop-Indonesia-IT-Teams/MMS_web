const { db } = require("../config/db.js");

const getAllPerusahaan = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, nama_perusahaan, nama_singkat_perusahaan FROM m_perusahaan ORDER BY nama_perusahaan ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error("❌ Error getAllPerusahaan:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getAllPerusahaan };
