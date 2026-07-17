const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const { db } = require("../config/db.js");

const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");
const DEFAULT_KOP_FILENAME = "kop-tekno.jpg";
const FALLBACK_PIXEL_URI =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const _kopBase64Cache = new Map();

function loadKopAsBase64Uri(filename) {
  if (_kopBase64Cache.has(filename)) return _kopBase64Cache.get(filename);
  try {
    const imgBuffer = fs.readFileSync(path.join(ASSETS_DIR, filename));
    const b64 = imgBuffer.toString("base64");
    const uri = `data:image/jpeg;base64,${b64}`;
    _kopBase64Cache.set(filename, uri);
    console.log(
      `[PDF] ${filename} loaded as base64, size:`,
      Math.round(b64.length / 1024),
      "KB",
    );
    return uri;
  } catch (err) {
    console.error(`[PDF] Could not load ${filename}:`, err.message);
    return null;
  }
}

function resolveKopBase64Uri(namaSingkatPerusahaan) {
  const candidate = namaSingkatPerusahaan
    ? `kop-${String(namaSingkatPerusahaan).trim().toLowerCase()}.jpg`
    : null;

  if (candidate && candidate !== DEFAULT_KOP_FILENAME) {
    const candidatePath = path.join(ASSETS_DIR, candidate);
    if (fs.existsSync(candidatePath)) {
      const uri = loadKopAsBase64Uri(candidate);
      if (uri) return uri;
    }
  }

  return loadKopAsBase64Uri(DEFAULT_KOP_FILENAME) || FALLBACK_PIXEL_URI;
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
    } catch {}
  }
  return trimmed ? [trimmed] : [];
}

function formatDateId(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateSlug(dateString) {
  if (!dateString) return "tanpa-tanggal";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
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

// Photos are displayed at ~160x130 CSS px in the report grid; 480px covers
// that at print/zoom resolution without embedding full-resolution originals.
const FOTO_MAX_DIMENSION = 480;
const FOTO_JPEG_QUALITY = 75;

async function imagePathToBase64Uri(relativePath, backendRoot) {
  try {
    const cleaned = relativePath.replace(/^\/+/, "");
    const abs = path.join(backendRoot, cleaned);
    const buffer = await sharp(abs)
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
    console.error(`[PDF] Could not load foto ${relativePath}:`, err.message);
    return null;
  }
}

function getTemplate() {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "maintenance-report.html",
  );
  return fs.readFileSync(templatePath, "utf-8");
}

async function buildHtml(record, alat, backendRoot, namaSingkatPerusahaan) {
  let template = getTemplate();

  template = template.replace(
    "{{KOP_BG_URI}}",
    resolveKopBase64Uri(namaSingkatPerusahaan),
  );

  const nama = alat?.nama || "-";
  const lokasi = alat?.lokasi || "-";
  const jenis = alat?.jenis || "-";

  const deviceArr = parseArrayField(alat?.device);
  const sensorArr = parseArrayField(alat?.sensor);
  const deviceStr = deviceArr.length ? deviceArr.join(", ") : "-";
  const sensorStr = sensorArr.length ? sensorArr.join(", ") : "-";

  const alatDisplay = `${esc(nama)} &nbsp;·&nbsp; ${esc(deviceStr)}`;

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
  const rencanaBeriktnya = esc(record.berikutnya);

  let keteranganRow = "";
  if (record.keterangan && record.keterangan.trim()) {
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

  let fotoContent = "";
  if (fotoUris.length === 0) {
    fotoContent = `<div class="foto-empty">Tidak ada foto dokumentasi.</div>`;
  } else {
    const items = fotoUris
      .map(
        (uri) =>
          `<div class="foto-item"><img src="${uri}" alt="Foto maintenance" /></div>`,
      )
      .join("\n");
    fotoContent = `<div class="foto-grid">${items}</div>`;
  }

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
    .replace("{{RENCANA_BERIKUTNYA}}", rencanaBeriktnya)
    .replace("{{KETERANGAN_ROW}}", keteranganRow)
    .replace("{{FOTO_CONTENT}}", fotoContent);
}

async function renderPdf(html) {
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

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

const BACKEND_ROOT = path.join(__dirname, "..");

const getPreventivePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor, a.i_alat AS alat_foto,
              p.nama_singkat_perusahaan
       FROM m_record r
       LEFT JOIN m_alat a ON r.id_m_alat = a.id
       LEFT JOIN m_client c ON a.pelanggan = c.id
       LEFT JOIN m_perusahaan p ON c.id_perusahaan = p.id
       WHERE r.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Record tidak ditemukan" });
    }

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
    const pdfBuffer = await renderPdf(html);

    const namaAlat = (alat?.nama || `record-${id}`).replace(/\s+/g, "-");
    const tanggalSlug = formatDateSlug(record.tanggal);
    const filename = `Laporan-Preventive-${namaAlat}-${tanggalSlug}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (error) {
    console.error("[PDF] Preventive error:", error);
    return res
      .status(500)
      .json({ message: "Gagal generate PDF", error: error.message });
  }
};

/**
 * GET /api/maintenance/corrective/:id/pdf
 */
const getCorrectivePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT r.*, a.nama, a.lokasi, a.jenis, a.device, a.sensor, a.i_alat AS alat_foto,
              p.nama_singkat_perusahaan
       FROM m_record_corrective r
       LEFT JOIN m_alat a ON r.id_m_alat = a.id
       LEFT JOIN m_client c ON a.pelanggan = c.id
       LEFT JOIN m_perusahaan p ON c.id_perusahaan = p.id
       WHERE r.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Record tidak ditemukan" });
    }

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
    const pdfBuffer = await renderPdf(html);

    const namaAlat = (alat?.nama || `record-${id}`).replace(/\s+/g, "-");
    const tanggalSlug = formatDateSlug(record.tanggal);
    const filename = `Laporan-Corrective-${namaAlat}-${tanggalSlug}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (error) {
    console.error("[PDF] Corrective error:", error);
    return res
      .status(500)
      .json({ message: "Gagal generate PDF", error: error.message });
  }
};

module.exports = { getPreventivePdf, getCorrectivePdf };
