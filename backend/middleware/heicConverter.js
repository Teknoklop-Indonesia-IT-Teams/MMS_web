const heicConvert = require("heic-convert");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

/**
 * Auto HEIC Converter Middleware
 * Automatically detects HEIC files and converts them to JPEG for browser compatibility
 */
const autoHeicConverter = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { filename, path: filePath } = req.file;
  const fileExtension = path.extname(filename).toLowerCase();

  try {
    // Check if uploaded file is HEIC/HEIF
    if (fileExtension === ".heic" || fileExtension === ".heif") {
      // Read HEIC file
      const inputBuffer = await fs.readFile(filePath);

      // Get file stats
      const originalStats = await fs.stat(filePath);

      // Convert HEIC to JPEG
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: "JPEG",
        quality: 0.8,
      });

      // Generate JPEG filename (replace original)
      const jpegFilename = filename.replace(/\.(heic|heif)$/i, ".jpg");
      const jpegPath = path.join(path.dirname(filePath), jpegFilename);

      // Save converted JPEG
      await fs.writeFile(jpegPath, outputBuffer);

      // Remove original HEIC file to save space
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn(
          "⚠️ Could not remove original HEIC file:",
          unlinkError.message
        );
      }

      // Update req.file to point to converted JPEG
      req.file.filename = jpegFilename;
      req.file.path = jpegPath;
      req.file.mimetype = "image/jpeg";
      req.file.size = outputBuffer.length;
      req.file.displayFilename = jpegFilename;
      req.file.originalFormat = "heic";
      req.file.autoConverted = true;
    } else {
      // For non-HEIC files, no conversion needed
      req.file.displayFilename = filename;
      req.file.originalFormat = "standard";
      req.file.autoConverted = false;
    }
  } catch (error) {
    console.error("❌ Auto HEIC conversion failed:", error);

    // Fallback: use original file if conversion fails
    req.file.displayFilename = filename;
    req.file.originalFormat =
      fileExtension === ".heic" || fileExtension === ".heif"
        ? "heic"
        : "standard";
    req.file.autoConverted = false;
    req.file.conversionError = error.message;

    // Continue processing - don't fail the upload
  }

  next();
};

module.exports = autoHeicConverter;
