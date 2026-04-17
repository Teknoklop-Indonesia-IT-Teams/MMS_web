const { db } = require("../config/db.js");
const fs = require("fs");
const path = require("path");

// Hapus file gambar yang tersimpan sebagai JSON array di kolom i_alat
const deleteRecordImages = (i_alat) => {
  if (!i_alat) return;
  let filePaths = [];
  try {
    filePaths = JSON.parse(i_alat);
  } catch {
    if (typeof i_alat === "string" && i_alat.startsWith("/uploads/")) {
      filePaths = [i_alat];
    }
  }
  if (!Array.isArray(filePaths)) return;
  for (const filePath of filePaths) {
    const absPath = path.join(__dirname, "..", filePath);
    fs.unlink(absPath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error(`Gagal menghapus gambar ${absPath}:`, err.message);
      }
    });
  }
};

const getAllRecords = async (req, res) => {
  try {
    const [records] = await db.query("SELECT * FROM m_record");

    const processedRecords = records.map((record) => ({
      ...record,
      i_panel: record.i_panel
        ? `data:image/jpeg;base64,${record.i_panel}`
        : null,
      i_alat: record.i_alat ? `data:image/jpeg;base64,${record.i_alat}` : null,
      i_sensor: record.i_sensor
        ? `data:image/jpeg;base64,${record.i_sensor}`
        : null,
    }));

    res.json(processedRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRecordById = async (req, res) => {
  try {
    const [records] = await db.query("SELECT * FROM m_record WHERE id = ?", [
      req.params.id,
    ]);
    if (records.length === 0) {
      return res.status(404).json({ message: "Record tidak ditemukan" });
    }

    const record = {
      ...records[0],
      i_panel: records[0].i_panel
        ? `data:image/jpeg;base64,${records[0].i_panel}`
        : null,
      i_alat: records[0].i_alat
        ? `data:image/jpeg;base64,${records[0].i_alat}`
        : null,
      i_sensor: records[0].i_sensor
        ? `data:image/jpeg;base64,${records[0].i_sensor}`
        : null,
    };

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRecordByEquipmentId = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await db.query(
      "SELECT * FROM m_record WHERE id_m_alat = ?",
      [id],
    );

    const parsed = records.map(row => ({
      ...row,
      i_alat: (() => {
        if (!row.i_alat) return null;
        try {
          return JSON.parse(row.i_alat);
        } catch {
          return [row.i_alat];
        }
      })()
    }));

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createRecord = async (req, res) => {
  console.log("===== CREATE RECORD DEBUG =====");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("FILES:", req.files);
  console.log("Content-Type:", req.headers["content-type"]);

  try {
    const {
      deskripsi,
      awal,
      tindakan,
      tambahan,
      akhir,
      berikutnya,
      keterangan,
      petugas,
      id_m_alat,
      tanggal,
    } = req.body;

    if (!id_m_alat || !tanggal || !deskripsi) {
      return res.status(400).json({
        message: "id_m_alat, tanggal, and deskripsi are required",
      });
    }

    // ✅ Ganti req.file → req.files (array)
    let i_alat = null;

    if (req.files && req.files.length > 0) {
      const filenames = req.files.map(f => `/uploads/${f.filename}`);
      i_alat = JSON.stringify(filenames); // '["/uploads/a.jpg","/uploads/b.jpg"]'
      console.log("✅ Files uploaded:", filenames);
    } else {
      console.log("⚠️ No files uploaded");
    }

    console.log("📦 Final values before insert:", {
      deskripsi, id_m_alat, tanggal, i_alat,
    });

    const [result] = await db.query(
      `INSERT INTO m_record 
      (deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas, i_alat, id_m_alat, tanggal) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deskripsi,
        awal,
        tindakan,
        tambahan,
        akhir,
        berikutnya,
        keterangan,
        petugas,
        i_alat,       // JSON string / null
        id_m_alat,
        tanggal,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      ...req.body,
      i_alat: i_alat ? JSON.parse(i_alat) : null, // kembalikan sebagai array
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRecord = async (req, res) => {
  try {
    const {
      deskripsi,
      awal,
      tindakan,
      tambahan,
      akhir,
      berikutnya,
      keterangan,
      petugas,
      i_alat,
      id_m_alat,
      tanggal,
    } = req.body;

    const processImage = (base64String) => {
      if (!base64String) return null;
      if (base64String.startsWith("data:image")) {
        return base64String.split(",")[1];
      }
      return base64String;
    };

    const processed_i_alat = processImage(i_alat);

    await db.query(
      "UPDATE m_record SET deskripsi = ?, awal = ?, tindakan = ?, tambahan = ?, akhir = ?, berikutnya = ?, keterangan = ?, petugas = ?, i_alat = ?, id_m_alat = ?, tanggal = ? WHERE id = ?",
      [
        deskripsi,
        awal,
        tindakan,
        tambahan,
        akhir,
        berikutnya,
        keterangan,
        petugas,
        processed_i_alat,
        id_m_alat,
        tanggal,
        req.params.id,
      ],
    );

    res.json({
      id: req.params.id,
      ...req.body,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT i_alat FROM m_record WHERE id = ?", [req.params.id]);
    if (rows.length > 0) deleteRecordImages(rows[0].i_alat);

    await db.query("DELETE FROM m_record WHERE id = ?", [req.params.id]);
    res.json({ message: "Record berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCorrectiveRecords = async (req, res) => {
  try {
    const [records] = await db.query("SELECT * FROM m_record_corrective");

    const processedRecords = records.map((record) => ({
      ...record,
      i_panel: record.i_panel
        ? `data:image/jpeg;base64,${record.i_panel}`
        : null,
      i_alat: record.i_alat ? `data:image/jpeg;base64,${record.i_alat}` : null,
      i_sensor: record.i_sensor
        ? `data:image/jpeg;base64,${record.i_sensor}`
        : null,
    }));

    res.json(processedRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCorrectiveRecordById = async (req, res) => {
  try {
    const [records] = await db.query(
      "SELECT * FROM m_record_corrective WHERE id = ?",
      [req.params.id],
    );
    if (records.length === 0) {
      return res.status(404).json({ message: "Record tidak ditemukan" });
    }

    const record = {
      ...records[0],
      i_panel: records[0].i_panel
        ? `data:image/jpeg;base64,${records[0].i_panel}`
        : null,
      i_alat: records[0].i_alat
        ? `data:image/jpeg;base64,${records[0].i_alat}`
        : null,
      i_sensor: records[0].i_sensor
        ? `data:image/jpeg;base64,${records[0].i_sensor}`
        : null,
    };

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCorrectiveRecordByEquipmentId = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await db.query(
      "SELECT * FROM m_record_corrective WHERE id_m_alat = ?",
      [id],
    );

    // ✅ Pastikan ini ada
    const parsed = records.map(row => ({
      ...row,
      i_alat: (() => {
        if (!row.i_alat) return null;
        try { return JSON.parse(row.i_alat); }
        catch { return [row.i_alat]; }
      })()
    }));

    res.json(parsed); // ← kirim parsed, bukan records
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createCorrectiveRecord = async (req, res) => {
  try {
    const {
      deskripsi, awal, tindakan, tambahan, akhir,
      berikutnya, keterangan, petugas, id_m_alat, tanggal,
    } = req.body;

    if (!id_m_alat || !tanggal || !deskripsi) {
      return res.status(400).json({
        message: "id_m_alat, tanggal, and deskripsi are required",
      });
    }

    // ✅ Ganti base64 logic → req.files
    let i_alat = null;
    if (req.files && req.files.length > 0) {
      const filenames = req.files.map(f => `/uploads/${f.filename}`);
      i_alat = JSON.stringify(filenames);
      console.log("✅ Files uploaded:", filenames);
    }

    const [result] = await db.query(
      `INSERT INTO m_record_corrective 
      (deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas, i_alat, id_m_alat, tanggal) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas, i_alat, id_m_alat, tanggal],
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

const updateCorrectiveRecord = async (req, res) => {
  try {
    const {
      deskripsi,
      awal,
      tindakan,
      tambahan,
      akhir,
      berikutnya,
      keterangan,
      petugas,
      i_alat,
      id_m_alat,
      tanggal,
    } = req.body;

    const processImage = (base64String) => {
      if (!base64String) return null;
      if (base64String.startsWith("data:image")) {
        return base64String.split(",")[1];
      }
      return base64String;
    };

    const processed_i_alat = processImage(i_alat);

    await db.query(
      "UPDATE m_record_corrective SET deskripsi = ?, awal = ?, tindakan = ?, tambahan = ?, akhir = ?, berikutnya = ?, keterangan = ?, petugas = ?, i_alat = ?, id_m_alat = ?, tanggal = ? WHERE id = ?",
      [
        deskripsi,
        awal,
        tindakan,
        tambahan,
        akhir,
        berikutnya,
        keterangan,
        petugas,
        processed_i_alat,
        id_m_alat,
        tanggal,
        req.params.id,
      ],
    );

    res.json({
      id: req.params.id,
      ...req.body,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCorrectiveRecord = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT i_alat FROM m_record_corrective WHERE id = ?", [req.params.id]);
    if (rows.length > 0) deleteRecordImages(rows[0].i_alat);

    await db.query("DELETE FROM m_record_corrective WHERE id = ?", [req.params.id]);
    res.json({ message: "Record berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // Preventive Maintenance Records
  getAllRecords,
  getRecordById,
  getRecordByEquipmentId,
  createRecord,
  updateRecord,
  deleteRecord,
  // Corrective Maintenance Records
  getAllCorrectiveRecords,
  getCorrectiveRecordById,
  getCorrectiveRecordByEquipmentId,
  createCorrectiveRecord,
  updateCorrectiveRecord,
  deleteCorrectiveRecord,
};
