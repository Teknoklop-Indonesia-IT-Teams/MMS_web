const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "." + file.originalname.split(".").pop();
    cb(null, uniqueSuffix);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Get file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Allowed image extensions including HEIC
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".heic",
    ".heif",
  ];

  // Allowed MIME types
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/octet-stream", // HEIC files sometimes come as this
  ];

  // Check by extension first (more reliable for HEIC)
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  }
  // Then check by MIME type
  else if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  }
  // Special handling for HEIC files that might not have proper MIME type
  else if (fileExtension === ".heic" || fileExtension === ".heif") {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed! Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP, HEIC, HEIF"
      ),
      false
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
