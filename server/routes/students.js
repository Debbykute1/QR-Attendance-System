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
    const existingStudent = db
      .prepare("SELECT * FROM students WHERE student_id = ?")
      .get(student_id);

    if (existingStudent) {
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
    const statement = db.prepare(`
      INSERT INTO students
      (student_id, name, email, department, qr_code)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = statement.run(
      student_id,
      name,
      email || null,
      department || null,
      qrCode
    );

    // Return newly created student
    res.status(201).json({
      message: "Student registered successfully",

      student: {
        id: result.lastInsertRowid,
        student_id,
        name,
        email: email || null,
        department: department || null,
        qr_code: qrCode,
      },
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
    const students = db
      .prepare(`
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
      `)
      .all();

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

        // Save generated QR code to database
        db.prepare(`
          UPDATE students
          SET qr_code = ?
          WHERE id = ?
        `).run(qrCode, student.id);

        // Add QR code to response
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
    const student = db
      .prepare(`
        SELECT
          id,
          student_id,
          name,
          email,
          department,
          qr_code,
          created_at
        FROM students
        WHERE student_id = ?
      `)
      .get(req.params.student_id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // ==========================================
    // Generate QR code if missing
    // ==========================================
    if (!student.qr_code) {
      const qrData = JSON.stringify({
        student_id: student.student_id,
        name: student.name,
      });

      const qrCode = await QRCode.toDataURL(qrData);

      db.prepare(`
        UPDATE students
        SET qr_code = ?
        WHERE id = ?
      `).run(qrCode, student.id);

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