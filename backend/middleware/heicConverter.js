const heicConvert = require("heic-convert");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

const autoHeicConverter = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { filename, path: filePath } = req.file;
  const fileExtension = path.extname(filename).toLowerCase();

  try {
    if (fileExtension === ".heic" || fileExtension === ".heif") {
      const inputBuffer = await fs.readFile(filePath);

      const originalStats = await fs.stat(filePath);

      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: "JPEG",
        quality: 0.8,
      });

      const jpegFilename = filename.replace(/\.(heic|heif)$/i, ".jpg");
      const jpegPath = path.join(path.dirname(filePath), jpegFilename);

      await fs.writeFile(jpegPath, outputBuffer);

      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn(
          "⚠️ Could not remove original HEIC file:",
          unlinkError.message,
        );
      }

      req.file.filename = jpegFilename;
      req.file.path = jpegPath;
      req.file.mimetype = "image/jpeg";
      req.file.size = outputBuffer.length;
      req.file.displayFilename = jpegFilename;
      req.file.originalFormat = "heic";
      req.file.autoConverted = true;
    } else {
      req.file.displayFilename = filename;
      req.file.originalFormat = "standard";
      req.file.autoConverted = false;
    }
  } catch (error) {
    console.error("❌ Auto HEIC conversion failed:", error);

    req.file.displayFilename = filename;
    req.file.originalFormat =
      fileExtension === ".heic" || fileExtension === ".heif"
        ? "heic"
        : "standard";
    req.file.autoConverted = false;
    req.file.conversionError = error.message;
  }

  next();
};

module.exports = autoHeicConverter;
