const express = require("express");
const db = require("../database/db");

const router = express.Router();

// Record attendance
router.post("/", (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({
        message: "Student ID is required"
      });
    }

    // Check if student exists
    const student = db
      .prepare("SELECT * FROM students WHERE student_id = ?")
      .get(student_id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get current date and time
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
    const existingAttendance = db
      .prepare(`
        SELECT * FROM attendance
        WHERE student_id = ?
        AND attendance_date = ?
      `)
      .get(student_id, date);

    if (existingAttendance) {
      return res.status(409).json({
        message: "Attendance already recorded for today",
        attendance: existingAttendance
      });
    }

    // Record attendance
    const statement = db.prepare(`
      INSERT INTO attendance
      (student_id, attendance_date, attendance_time)
      VALUES (?, ?, ?)
    `);

    const result = statement.run(
      student_id,
      date,
      time
    );

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance: {
        id: result.lastInsertRowid,
        student_id,
        name: student.name,
        attendance_date: date,
        attendance_time: time
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to record attendance",
      error: error.message
    });
  }
});


// Get all attendance records
router.get("/", (req, res) => {
  try {
    const attendance = db
      .prepare(`
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
      `)
      .all();

    res.json(attendance);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message
    });
  }
});

module.exports = router;