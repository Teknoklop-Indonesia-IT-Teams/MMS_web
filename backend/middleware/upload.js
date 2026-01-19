const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");

    // Pastikan folder uploads ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created uploads directory:", uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate safe filename
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);

    // Buat filename yang aman
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${safeName}_${timestamp}_${random}${ext}`;

    console.log("📝 Generated filename:", {
      original: file.originalname,
      saved: filename,
      extension: ext,
    });

    cb(null, filename);
  },
});

// File filter dengan support HEIC/HEIF
const fileFilter = (req, file, cb) => {
  console.log("🔍 Checking file:", file.originalname);

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".heic",
    ".heif",
    ".heics",
    ".heifs",
    ".avif",
  ];

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
    "image/avif",
    "image/tiff",
    "application/octet-stream",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  console.log("📊 File info:", { ext, mime, size: file.size });

  // Check by extension
  if (allowedExtensions.includes(ext)) {
    console.log("✅ Allowed by extension:", ext);
    return cb(null, true);
  }

  // Check by MIME type
  if (allowedMimeTypes.includes(mime)) {
    console.log("✅ Allowed by MIME type:", mime);
    return cb(null, true);
  }

  // Special case for HEIC files
  if (ext === ".heic" || ext === ".heif") {
    console.log("✅ Allowing HEIC/HEIF file:", file.originalname);
    return cb(null, true);
  }

  console.log("❌ File rejected. Extension:", ext, "MIME:", mime);
  cb(new Error(`File type not allowed: ${ext} (${mime})`), false);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

module.exports = upload;
