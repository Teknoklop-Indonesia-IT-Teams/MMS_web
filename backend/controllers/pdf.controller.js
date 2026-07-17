"use strict";

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const { db } = require("../config/db.js");

const BACKEND_ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(BACKEND_ROOT, "public", "assets");
const UPLOADS_DIR = path.join(BACKEND_ROOT, "uploads");

const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
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

// Header/footer banners are resolved per-client's perusahaan: tries
// `kop-header-{nama_singkat_perusahaan}.{ext}` / `kop-footer-{...}.{ext}`
// (any common image extension). Clients with no perusahaan assigned (or one
// that doesn't match any m_perusahaan row) get NO banner at all — no
// implicit fallback to any single company's letterhead.
const BANNER_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const _bannerBase64Cache = new Map();

function loadBannerAsBase64Uri(filename) {
  if (_bannerBase64Cache.has(filename)) return _bannerBase64Cache.get(filename);
  const uri = imageToBase64(path.join(ASSETS_DIR, filename));
  if (uri) {
    console.log(`[PDF] ${filename} loaded as base64`);
    _bannerBase64Cache.set(filename, uri);
  }
  return uri;
}

function findBannerFile(prefix, shortname) {
  for (const ext of BANNER_EXTENSIONS) {
    const filename = `${prefix}-${shortname}${ext}`;
    if (fs.existsSync(path.join(ASSETS_DIR, filename))) return filename;
  }
  return null;
}

function resolveBannerUri(prefix, namaSingkatPerusahaan) {
  const shortname = namaSingkatPerusahaan
    ? String(namaSingkatPerusahaan).trim().toLowerCase()
    : null;

  if (!shortname) return "";

  const file = findBannerFile(prefix, shortname);
  return file ? loadBannerAsBase64Uri(file) || "" : "";
}

function getHeaderUri(namaSingkatPerusahaan) {
  return resolveBannerUri("kop-header", namaSingkatPerusahaan);
}

function getFooterUri(namaSingkatPerusahaan) {
  return resolveBannerUri("kop-footer", namaSingkatPerusahaan);
}

// Photos are displayed at ~160x130 CSS px in the report grid; 480px covers
// that at print/zoom resolution without embedding full-resolution originals.
const FOTO_MAX_DIMENSION = 480;
const FOTO_JPEG_QUALITY = 75;

async function imageToBase64Resized(absPath) {
  try {
    const buffer = await sharp(absPath)
      .rotate()
      .resize({
        width: FOTO_MAX_DIMENSION,
        height: FOTO_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: FOTO_JPEG_QUALITY })
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.warn("[PDF] Cannot read/resize photo:", absPath, "—", err.message);
    return null;
  }
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

async function buildHtml(record, alat) {
  const template = getTemplate();

  // Alat fields
  const nama = alat?.nama || "-";
  const lokasi = alat?.lokasi || "-";
  const jenis = alat?.jenis || "-";
  const deviceStr = parseArrayField(alat?.device).join(", ") || "-";
  const alatDisplay = `${esc(nama)} &nbsp;·&nbsp; ${esc(deviceStr)}`;

  // Title
  const judul = `Laporan Maintenance ${esc(nama)}`;
  const subjudul = `${esc(jenis)} &nbsp;·&nbsp; ${esc(lokasi)}`;

  // Record fields
  const tanggal = formatDateId(record.tanggal);
  const petugas = esc(record.petugas);
  const deskripsi = esc(record.deskripsi);
  const kondisiAwal = esc(record.awal);
  const tindakan = esc(record.tindakan);
  const tindakanTambahan = esc(record.tambahan);
  const kondisiAkhir = esc(record.akhir);
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
      fotoPaths.map((p) => imageToBase64Resized(uploadPathToAbs(p))),
    )
  ).filter(Boolean);

  const fotoContent = fotoUris.length
    ? `<div class="foto-grid">${fotoUris
        .map((uri) => `<div class="foto-item"><img src="${uri}" alt="Foto maintenance" /></div>`)
        .join("\n")}</div>`
    : `<div class="foto-empty">Tidak ada foto dokumentasi.</div>`;

  return template
    .replace("{{JUDUL}}", judul)
    .replace("{{SUBJUDUL}}", subjudul)
    .replace("{{TANGGAL}}", tanggal)
    .replace("{{ALAT}}", alatDisplay)
    .replace(/{{PETUGAS}}/g, petugas)
    .replace("{{DESKRIPSI}}", deskripsi)
    .replace("{{KONDISI_AWAL}}", kondisiAwal)
    .replace("{{TINDAKAN}}", tindakan)
    .replace("{{TINDAKAN_TAMBAHAN}}", tindakanTambahan)
    .replace("{{KONDISI_AKHIR}}", kondisiAkhir)
    .replace("{{RENCANA_BERIKUTNYA}}", rencanaBerikutnya)
    .replace("{{KETERANGAN_ROW}}", keteranganRow)
    .replace("{{FOTO_CONTENT}}", fotoContent);
}

async function renderPdf(html, namaSingkatPerusahaan) {
  const headerUri = getHeaderUri(namaSingkatPerusahaan);
  const footerUri = getFooterUri(namaSingkatPerusahaan);

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
        top:    "200px",
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
}

function buildAlat(row) {
  if (!row.nama) return null;
  return {
    nama: row.nama,
    lokasi: row.lokasi,
    jenis: row.jenis,
    device: row.device,
    sensor: row.sensor,
  };
}

function sendPdf(res, pdfBuffer, prefix, alatNama, tanggal, id) {
  const namaAlat = (alatNama || `record-${id}`).replace(/\s+/g, "-");
  const tanggalSlug = formatDateSlug(tanggal);
  const filename = `Laporan-${prefix}-${namaAlat}-${tanggalSlug}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  return res.end(pdfBuffer);
}

const getPreventivePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor,
              p.nama_singkat_perusahaan
       FROM m_record r
       LEFT JOIN m_alat a ON r.id_m_alat = a.id
       LEFT JOIN m_client c ON a.pelanggan = c.id
       LEFT JOIN m_perusahaan p ON c.id_perusahaan = p.id
       WHERE r.id = ?`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ message: "Record tidak ditemukan" });

    const row = rows[0];
    const record = buildRecord(row);
    const alat = buildAlat(row);

    const html = await buildHtml(record, alat);
    const pdfBuffer = await renderPdf(html, row.nama_singkat_perusahaan);
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
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor,
              p.nama_singkat_perusahaan
       FROM m_record_corrective r
       LEFT JOIN m_alat a ON r.id_m_alat = a.id
       LEFT JOIN m_client c ON a.pelanggan = c.id
       LEFT JOIN m_perusahaan p ON c.id_perusahaan = p.id
       WHERE r.id = ?`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ message: "Record tidak ditemukan" });

    const row = rows[0];
    const record = buildRecord(row);
    const alat = buildAlat(row);

    const html = await buildHtml(record, alat);
    const pdfBuffer = await renderPdf(html, row.nama_singkat_perusahaan);
    return sendPdf(res, pdfBuffer, "Corrective", alat?.nama, record.tanggal, id);
  } catch (err) {
    console.error("[PDF] Corrective error:", err);
    return res.status(500).json({ message: "Gagal generate PDF", error: err.message });
  }
};

module.exports = { getPreventivePdf, getCorrectivePdf };
