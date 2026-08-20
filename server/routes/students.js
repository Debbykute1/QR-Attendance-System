const express = require("express");
const QRCode = require("qrcode");
const db = require("../database/db");

const router = express.Router();

// ==========================================
// Register a new student
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { student_id, name, email, department } = req.body;

    // Validate required fields
    if (!student_id || !name) {
      return res.status(400).json({
        message: "Student ID and name are required",
      });
    }

    // Check if student already exists
    const existingStudent = await db.query(
      "SELECT * FROM students WHERE student_id = $1",
      [student_id]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(409).json({
        message: "Student already exists",
      });
    }

    // Data stored inside the QR code
    const qrData = JSON.stringify({
      student_id,
      name,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrData);

    // Save student
    const result = await db.query(
      `
      INSERT INTO students
      (student_id, name, email, department, qr_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, student_id, name, email, department, qr_code
      `,
      [
        student_id,
        name,
        email || null,
        department || null,
        qrCode,
      ]
    );

    const student = result.rows[0];

    res.status(201).json({
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    console.error("Register student error:", error);

    res.status(500).json({
      message: "Failed to register student",
      error: error.message,
    });
  }
});

// ==========================================
// Get all students
// ==========================================
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        student_id,
        name,
        email,
        department,
        qr_code,
        created_at
      FROM students
      ORDER BY id DESC
    `);

    const students = result.rows;

    // ==========================================
    // Generate QR codes for old students
    // that don't have one
    // ==========================================
    for (const student of students) {
      if (!student.qr_code) {
        const qrData = JSON.stringify({
          student_id: student.student_id,
          name: student.name,
        });

        const qrCode = await QRCode.toDataURL(qrData);

        await db.query(
          `
          UPDATE students
          SET qr_code = $1
          WHERE id = $2
          `,
          [qrCode, student.id]
        );

        student.qr_code = qrCode;
      }
    }

    res.json(students);
  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

// ==========================================
// Get one student
// ==========================================
router.get("/:student_id", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        id,
        student_id,
        name,
        email,
        department,
        qr_code,
        created_at
      FROM students
      WHERE student_id = $1
      `,
      [req.params.student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const student = result.rows[0];

    // ==========================================
    // Generate QR code if missing
    // ==========================================
    if (!student.qr_code) {
      const qrData = JSON.stringify({
        student_id: student.student_id,
        name: student.name,
      });

      const qrCode = await QRCode.toDataURL(qrData);

      await db.query(
        `
        UPDATE students
        SET qr_code = $1
        WHERE id = $2
        `,
        [qrCode, student.id]
      );

      student.qr_code = qrCode;
    }

    res.json(student);
  } catch (error) {
    console.error("Get student error:", error);

    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
});

module.exports = router;