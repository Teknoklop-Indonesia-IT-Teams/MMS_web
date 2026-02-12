const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    const [users] = await db.query("SELECT * FROM m_user WHERE id = ?", [
      decoded.userId,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        message: "Token is valid but user no longer exists.",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(401).json({
      message: "Token verification failed.",
      code: "TOKEN_VERIFICATION_FAILED",
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key",
        );
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        };
      } catch (error) {
        console.log("⚠️ Optional auth: Invalid token, continuing without auth");
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error("❌ Optional auth middleware error:", error);
    req.user = null;
    next();
  }
};

module.exports = { authMiddleware, optionalAuthMiddleware, upload };
