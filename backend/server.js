const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const { debugMiddleware } = require("./middleware/debug.js");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      "https://teknoklop.com",
      "https://mms.teknoklop.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.18.116:5173",
      "http://192.168.18.116:5174",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".bmp": "image/bmp",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".heic": "image/heic",
        ".heif": "image/heif",
        ".heics": "image/heic-sequence",
        ".heifs": "image/heif-sequence",
        ".avif": "image/avif",
        ".tiff": "image/tiff",
        ".tif": "image/tiff",
      };

      if (mimeTypes[ext]) {
        res.setHeader("Content-Type", mimeTypes[ext]);
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

      if (ext === ".svg" || ext === ".ico") {
        res.setHeader("Cache-Control", "public, max-age=604800");
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }

      const reqUrl = res.req.originalUrl;
      if (reqUrl.includes("?")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  }),
);

app.use(debugMiddleware);

const alatRoutes = require("./routes/alat.routes.js");
const staffRoutes = require("./routes/staff.routes.js");
const recordRoutes = require("./routes/record.routes.js");
const itemsRoutes = require("./routes/items.routes.js");
const rolesRoutes = require("./routes/roles.routes.js");
const emailRoutes = require("./routes/email.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const usersRoutes = require("./routes/users.routes.js");

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MMS API",
    status: "API is running",
    endpoints: {
      alat: "/api/alat",
      staff: "/api/staff",
      record: "/api/record",
      items: "/api/items",
      roles: "/api/roles",
      users: "/api/users",
      auth: "/api/auth",
      email: "/api/email",
    },
  });
});

app.use("/api/alat", alatRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/record", recordRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 3001;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something broke!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.use((req, res, next) => {
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
