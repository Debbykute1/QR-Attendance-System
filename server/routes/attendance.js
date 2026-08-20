const express = require("express");
const db = require("../database/db");

const router = express.Router();

// ==========================================
// Record attendance
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({
        message: "Student ID is required",
      });
    }

    // Check if student exists
    const studentResult = await db.query(
      "SELECT * FROM students WHERE student_id = $1",
      [student_id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const student = studentResult.rows[0];

    // Get current date and time in Nigeria
    const now = new Date();

    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
    }).format(now);

    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    // Check if attendance was already recorded today
    const existingAttendance = await db.query(
      `
      SELECT *
      FROM attendance
      WHERE student_id = $1
      AND attendance_date = $2
      `,
      [student_id, date]
    );

    if (existingAttendance.rows.length > 0) {
      return res.status(409).json({
        message: "Attendance already recorded for today",
        attendance: existingAttendance.rows[0],
      });
    }

    // Record attendance
    const result = await db.query(
      `
      INSERT INTO attendance
      (student_id, attendance_date, attendance_time)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [student_id, date, time]
    );

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance: {
        id: result.rows[0].id,
        student_id,
        name: student.name,
        attendance_date: date,
        attendance_time: time,
      },
    });
  } catch (error) {
    console.error("Record attendance error:", error);

    res.status(500).json({
      message: "Failed to record attendance",
      error: error.message,
    });
  }
});

// ==========================================
// Get all attendance records
// ==========================================
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        attendance.id,
        attendance.student_id,
        students.name,
        students.department,
        attendance.attendance_date,
        attendance.attendance_time
      FROM attendance
      JOIN students
        ON attendance.student_id = students.student_id
      ORDER BY attendance.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get attendance error:", error);

    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

module.exports = router;