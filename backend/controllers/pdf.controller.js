"use strict";

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const { db } = require("../config/db.js");

const BACKEND_ROOT = path.join(__dirname, "..");
const ASSETS_DIR   = path.join(BACKEND_ROOT, "public", "assets");
const UPLOADS_DIR  = path.join(BACKEND_ROOT, "uploads");

const MIME = {
  jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png",  gif: "image/gif",
  webp: "image/webp", bmp: "image/bmp",
  jfif: "image/jpeg",
};

function imageToBase64(absPath) {
  try {
    const buf = fs.readFileSync(absPath);
    const ext = path.extname(absPath).replace(".", "").toLowerCase();
    const mime = MIME[ext] || "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.warn("[PDF] Cannot read image:", absPath, "—", err.message);
    return null;
  }
}

function uploadPathToAbs(dbPath) {
  const cleaned = String(dbPath || "").replace(/^\/+/, "");
  if (cleaned.startsWith("uploads/")) {
    return path.join(BACKEND_ROOT, cleaned);
  }
  return path.join(UPLOADS_DIR, path.basename(cleaned));
}

let _headerUri = null;
let _footerUri = null;

function bustKopCache() {
  _headerUri = null;
  _footerUri = null;
}

function getHeaderUri() {
  if (!_headerUri) {
    _headerUri = imageToBase64(path.join(ASSETS_DIR, "kop-header.jpg"));
    if (_headerUri) console.log("[PDF] kop-header.jpg loaded, size:", Math.round(_headerUri.length / 1024), "KB");
    else _headerUri = "";
  }
  return _headerUri;
}

function getFooterUri() {
  if (!_footerUri) {
    _footerUri = imageToBase64(path.join(ASSETS_DIR, "kop-footer.jpg"));
    if (_footerUri) console.log("[PDF] kop-footer.jpg loaded, size:", Math.round(_footerUri.length / 1024), "KB");
    else _footerUri = "";
  }
  return _footerUri;
}

function parseArrayField(value) {
  if (!value) return [];
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => (typeof v === "string" ? v.trim() : String(v)))
          .filter(Boolean);
      }
    } catch {
    }
  }
  return trimmed ? [trimmed] : [];
}

function formatDateId(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return String(dateString);
  }
}

function formatDateSlug(dateString) {
  if (!dateString) return "tanpa-tanggal";
  try {
    return new Date(dateString)
      .toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ /g, "-");
  } catch {
    return "tanpa-tanggal";
  }
}

function esc(str) {
  if (!str) return "-";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br/>");
}

function getTemplate() {
  return fs.readFileSync(
    path.join(BACKEND_ROOT, "templates", "maintenance-report.html"),
    "utf-8",
  );
}


function buildHtml(record, alat) {
  const template = getTemplate();

  // Alat fields
  const nama      = alat?.nama   || "-";
  const lokasi    = alat?.lokasi || "-";
  const jenis     = alat?.jenis  || "-";
  const deviceStr = parseArrayField(alat?.device).join(", ") || "-";
  const alatDisplay = `${esc(nama)} &nbsp;·&nbsp; ${esc(deviceStr)}`;

  // Title
  const judul    = `Laporan Maintenance ${esc(nama)}`;
  const subjudul = `${esc(jenis)} &nbsp;·&nbsp; ${esc(lokasi)}`;

  // Record fields
  const tanggal          = formatDateId(record.tanggal);
  const petugas          = esc(record.petugas);
  const deskripsi        = esc(record.deskripsi);
  const kondisiAwal      = esc(record.awal);
  const tindakan         = esc(record.tindakan);
  const tindakanTambahan = esc(record.tambahan);
  const kondisiAkhir     = esc(record.akhir);
  const rencanaBerikutnya = esc(record.berikutnya);

  // Optional keterangan
  let keteranganRow = "";
  if (record.keterangan && String(record.keterangan).trim()) {
    keteranganRow = `
      <tr>
        <td class="label">Keterangan</td>
        <td class="value">${esc(record.keterangan)}</td>
      </tr>`;
  }

  // Photos
  const fotoPaths = parseArrayField(record.i_alat);
  const fotoUris = (
    await Promise.all(
      fotoPaths.map((p) => imagePathToBase64Uri(p, backendRoot)),
    )
  ).filter(Boolean);

  let fotoContent;
  if (fotoPaths.length === 0) {
    fotoContent = `<div class="foto-empty">Tidak ada foto dokumentasi.</div>`;
  } else {
    const items = fotoPaths
      .map((dbPath) => {
        const absPath = uploadPathToAbs(dbPath);
        const uri = imageToBase64(absPath);
        if (!uri) {
          console.warn("[PDF] Skipping unreadable photo:", dbPath);
          return null;
        }
        return `<div class="foto-item"><img src="${uri}" alt="Foto maintenance" /></div>`;
      })
      .filter(Boolean)
      .join("\n");

    fotoContent = items.length
      ? `<div class="foto-grid">${items}</div>`
      : `<div class="foto-empty">Tidak ada foto dokumentasi.</div>`;
  }

  return template
    .replace("{{JUDUL}}",             judul)
    .replace("{{SUBJUDUL}}",          subjudul)
    .replace("{{TANGGAL}}",           tanggal)
    .replace("{{ALAT}}",              alatDisplay)
    .replace(/{{PETUGAS}}/g,          petugas)
    .replace("{{DESKRIPSI}}",         deskripsi)
    .replace("{{KONDISI_AWAL}}",      kondisiAwal)
    .replace("{{TINDAKAN}}",          tindakan)
    .replace("{{TINDAKAN_TAMBAHAN}}", tindakanTambahan)
    .replace("{{KONDISI_AKHIR}}",     kondisiAkhir)
    .replace("{{RENCANA_BERIKUTNYA}}",rencanaBerikutnya)
    .replace("{{KETERANGAN_ROW}}",    keteranganRow)
    .replace("{{FOTO_CONTENT}}",      fotoContent);
}

async function renderPdf(html) {
  const headerUri = getHeaderUri();
  const footerUri = getFooterUri();

  const headerTemplate = headerUri
    ? `<div style="width:100%;margin:-8px 0 0 0;padding:0;line-height:0;font-size:0;">` +
      `<img src="${headerUri}" style="width:100%;display:block;margin:0;padding:0;" />` +
      `</div>`
    : `<div></div>`;

  const footerTemplate = footerUri
    ? `<div style="width:100%;margin:0;padding:0;line-height:0;font-size:0;">` +
      `<img src="${footerUri}" style="width:100%;display:block;margin:0;padding:0;" />` +
      `</div>`
    : `<div></div>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top:    "160px",
        bottom: "134px",
        left:   "20px",
        right:  "20px",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}


function buildRecord(row) {
  return {
    id:         row.id,
    deskripsi:  row.deskripsi,
    awal:       row.awal,
    tindakan:   row.tindakan,
    tambahan:   row.tambahan,
    akhir:      row.akhir,
    berikutnya: row.berikutnya,
    keterangan: row.keterangan,
    petugas:    row.petugas,
    i_alat:     row.i_alat,      
    id_m_alat:  row.id_m_alat,
    tanggal:    row.tanggal,
  };
}

function buildAlat(row) {
  if (!row.nama) return null;
  return {
    nama:   row.nama,
    lokasi: row.lokasi,
    jenis:  row.jenis,
    device: row.device,
    sensor: row.sensor,
  };
}

function sendPdf(res, pdfBuffer, prefix, alatNama, tanggal, id) {
  const namaAlat    = (alatNama || `record-${id}`).replace(/\s+/g, "-");
  const tanggalSlug = formatDateSlug(tanggal);
  const filename    = `Laporan-${prefix}-${namaAlat}-${tanggalSlug}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  return res.end(pdfBuffer);
}

const getPreventivePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
<<<<<<< HEAD
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor, a.i_alat AS alat_foto,
              p.nama_singkat_perusahaan
=======
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor
>>>>>>> 495bc422fbf4debbb959e5340624e21890b08c69
       FROM m_record r
       LEFT JOIN m_alat a ON r.id_m_alat = a.id
       LEFT JOIN m_client c ON a.pelanggan = c.id
       LEFT JOIN m_perusahaan p ON c.id_perusahaan = p.id
       WHERE r.id = ?`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ message: "Record tidak ditemukan" });

    const row    = rows[0];
    const record = buildRecord(row);
    const alat   = buildAlat(row);

<<<<<<< HEAD
    const row = rows[0];

    const record = {
      id: row.id,
      deskripsi: row.deskripsi,
      awal: row.awal,
      tindakan: row.tindakan,
      tambahan: row.tambahan,
      akhir: row.akhir,
      berikutnya: row.berikutnya,
      keterangan: row.keterangan,
      petugas: row.petugas,
      i_alat: row.i_alat,
      id_m_alat: row.id_m_alat,
      tanggal: row.tanggal,
    };

    const alat = row.nama
      ? {
          nama: row.nama,
          lokasi: row.lokasi,
          jenis: row.jenis,
          device: row.device,
          sensor: row.sensor,
          i_alat: row.alat_foto,
        }
      : null;

    const html = await buildHtml(record, alat, BACKEND_ROOT, row.nama_singkat_perusahaan);
=======
    const html      = buildHtml(record, alat);
>>>>>>> 495bc422fbf4debbb959e5340624e21890b08c69
    const pdfBuffer = await renderPdf(html);
    return sendPdf(res, pdfBuffer, "Preventive", alat?.nama, record.tanggal, id);
  } catch (err) {
    console.error("[PDF] Preventive error:", err);
    return res.status(500).json({ message: "Gagal generate PDF", error: err.message });
  }
};

const getCorrectivePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
<<<<<<< HEAD
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor, a.i_alat AS alat_foto,
              p.nama_singkat_perusahaan
=======
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor
>>>>>>> 495bc422fbf4debbb959e5340624e21890b08c69
       FROM m_record_corrective r
       LEFT JOIN m_alat a ON r.id_m_alat = a.id
       LEFT JOIN m_client c ON a.pelanggan = c.id
       LEFT JOIN m_perusahaan p ON c.id_perusahaan = p.id
       WHERE r.id = ?`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ message: "Record tidak ditemukan" });

    const row    = rows[0];
    const record = buildRecord(row);
    const alat   = buildAlat(row);

<<<<<<< HEAD
    const row = rows[0];

    const record = {
      id: row.id,
      deskripsi: row.deskripsi,
      awal: row.awal,
      tindakan: row.tindakan,
      tambahan: row.tambahan,
      akhir: row.akhir,
      berikutnya: row.berikutnya,
      keterangan: row.keterangan,
      petugas: row.petugas,
      i_alat: row.i_alat,
      id_m_alat: row.id_m_alat,
      tanggal: row.tanggal,
    };

    const alat = row.nama
      ? {
          nama: row.nama,
          lokasi: row.lokasi,
          jenis: row.jenis,
          device: row.device,
          sensor: row.sensor,
          i_alat: row.alat_foto,
        }
      : null;

    const html = await buildHtml(record, alat, BACKEND_ROOT, row.nama_singkat_perusahaan);
=======
    const html      = buildHtml(record, alat);
>>>>>>> 495bc422fbf4debbb959e5340624e21890b08c69
    const pdfBuffer = await renderPdf(html);
    return sendPdf(res, pdfBuffer, "Corrective", alat?.nama, record.tanggal, id);
  } catch (err) {
    console.error("[PDF] Corrective error:", err);
    return res.status(500).json({ message: "Gagal generate PDF", error: err.message });
  }
};

module.exports = { getPreventivePdf, getCorrectivePdf };
