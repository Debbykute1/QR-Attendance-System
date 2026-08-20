const express = require("express");
const cors = require("cors");
const db = require("./database/db");

const studentRoutes = require("./routes/students");
const attendanceRoutes = require("./routes/attendance");

const app = express();

// Use the port provided by the hosting service
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "QR Attendance System API is running",
  });
});

// PostgreSQL database test route
app.get("/api/database-test", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('students', 'attendance')
      ORDER BY table_name
    `);

    res.json({
      message: "Database connection successful",
      tables: result.rows,
    });
  } catch (error) {
    console.error("Database test error:", error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});