const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created uploads directory:", uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);

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

  if (allowedExtensions.includes(ext)) {
    console.log("✅ Allowed by extension:", ext);
    return cb(null, true);
  }

  if (allowedMimeTypes.includes(mime)) {
    return cb(null, true);
  }

  if (ext === ".heic" || ext === ".heif") {
    return cb(null, true);
  }

  console.log("❌ File rejected. Extension:", ext, "MIME:", mime);
  cb(new Error(`File type not allowed: ${ext} (${mime})`), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;
