const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db.js");

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// JWT Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header, cookie, or query
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // 2. Check cookies
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 3. Check query parameter (for backward compatibility)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Optional: Verify user still exists in database
    const [users] = await db.query("SELECT * FROM m_user WHERE id = ?", [
      decoded.userId,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        message: "Token is valid but user no longer exists.",
        code: "USER_NOT_FOUND",
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    console.log("✅ Auth middleware: User authenticated:", req.user.email);
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

// Optional auth middleware - doesn't require token but sets user if available
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header, cookie, or query
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
          process.env.JWT_SECRET || "your-secret-key"
        );
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        };
        console.log("✅ Optional auth: User authenticated:", req.user.email);
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
