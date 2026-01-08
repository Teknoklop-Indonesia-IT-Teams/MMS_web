const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mms3",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
};

console.log("Attempting to connect to database:", {
  host: config.host,
  user: config.user,
  database: config.database,
});

const pool = mysql.createPool(config);
const db = pool.promise();

// Test the connection
db.query("SELECT 1")
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

module.exports = { db };
