const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const { debugMiddleware } = require("./middleware/debug.js");

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.18.116:5173",
      "http://192.168.18.116:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Important for cookies
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser()); // Add cookie parser middleware
app.use(morgan("dev"));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add debug middleware
app.use(debugMiddleware);

// Import routes
const alatRoutes = require("./routes/alat.routes.js");
const staffRoutes = require("./routes/staff.routes.js");
const recordRoutes = require("./routes/record.routes.js");
const itemsRoutes = require("./routes/items.routes.js");
const rolesRoutes = require("./routes/roles.routes.js");
const emailRoutes = require("./routes/email.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const usersRoutes = require("./routes/users.routes.js");

// Root route
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

// Use routes without authentication
app.use("/api/alat", alatRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/record", recordRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 3001;

// Error handling middleware
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
