const { db } = require("../config/db.js");

// CRUD for Equipment Preventive Maintenance Records
const getAllRecords = async (req, res) => {
  try {
    const [records] = await db.query("SELECT * FROM m_record");

    // Process records to add data:image prefix to base64 images
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

    // Process record to add data:image prefix to base64 images
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
      [id]
    );

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createRecord = async (req, res) => {
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

    // Validate required fields
    if (!id_m_alat || !tanggal || !deskripsi) {
      return res.status(400).json({
        message: "id_m_alat, tanggal, and deskripsi are required",
      });
    }

    // Process image data (remove data:image prefix if present)
    const processImage = (base64String) => {
      if (!base64String) return null;
      if (base64String.startsWith("data:image")) {
        return base64String.split(",")[1];
      }
      return base64String;
    };

    const processed_i_alat = processImage(i_alat);

    const [result] = await db.query(
      "INSERT INTO m_record (deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas, i_alat, id_m_alat, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      ]
    );

    res.status(201).json({
      id: result.insertId,
      ...req.body,
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
      i_panel,
      i_alat,
      i_sensor,
      id_m_alat,
      tanggal,
    } = req.body;

    // Process image data (remove data:image prefix if present)
    const processImage = (base64String) => {
      if (!base64String) return null;
      if (base64String.startsWith("data:image")) {
        return base64String.split(",")[1];
      }
      return base64String;
    };

    const processed_i_panel = processImage(i_panel);
    const processed_i_alat = processImage(i_alat);
    const processed_i_sensor = processImage(i_sensor);

    await db.query(
      "UPDATE m_record SET deskripsi = ?, awal = ?, tindakan = ?, tambahan = ?, akhir = ?, berikutnya = ?, keterangan = ?, petugas = ?, i_panel = ?, i_alat = ?, i_sensor = ?, id_m_alat = ?, tanggal = ? WHERE id = ?",
      [
        deskripsi,
        awal,
        tindakan,
        tambahan,
        akhir,
        berikutnya,
        keterangan,
        petugas,
        i_panel,
        i_alat,
        i_sensor,
        id_m_alat,
        tanggal,
        req.params.id,
      ]
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
    const [records] = await db.query("SELECT * FROM m_record_corrective WHERE id = ?", [
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

const getCorrectiveRecordByEquipmentId = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await db.query(
      "SELECT * FROM m_record_corrective WHERE id_m_alat = ?",
      [id]
    );

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createCorrectiveRecord = async (req, res) => {
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

    if (!id_m_alat || !tanggal || !deskripsi) {
      return res.status(400).json({
        message: "id_m_alat, tanggal, and deskripsi are required",
      });
    }

    const processImage = (base64String) => {
      if (!base64String) return null;
      if (base64String.startsWith("data:image")) {
        return base64String.split(",")[1];
      }
      return base64String;
    };

    const processed_i_alat = processImage(i_alat);

    const [result] = await db.query(
      "INSERT INTO m_record_corrective (deskripsi, awal, tindakan, tambahan, akhir, berikutnya, keterangan, petugas, i_alat, id_m_alat, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      ]
    );

    res.status(201).json({
      id: result.insertId,
      ...req.body,
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
      i_panel,
      i_alat,
      i_sensor,
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

    const processed_i_panel = processImage(i_panel);
    const processed_i_alat = processImage(i_alat);
    const processed_i_sensor = processImage(i_sensor);

    await db.query(
      "UPDATE m_record_corrective SET deskripsi = ?, awal = ?, tindakan = ?, tambahan = ?, akhir = ?, berikutnya = ?, keterangan = ?, petugas = ?, i_panel = ?, i_alat = ?, i_sensor = ?, id_m_alat = ?, tanggal = ? WHERE id = ?",
      [
        deskripsi,
        awal,
        tindakan,
        tambahan,
        akhir,
        berikutnya,
        keterangan,
        petugas,
        i_panel,
        i_alat,
        i_sensor,
        id_m_alat,
        tanggal,
        req.params.id,
      ]
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
