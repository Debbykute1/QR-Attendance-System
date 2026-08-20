const Database = require("better-sqlite3");
const path = require("path");

// Use DATABASE_PATH when deployed.
// Otherwise use the local attendance.db file.
const databasePath =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "..", "attendance.db");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    department TEXT,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );
`);

console.log(`Database initialized: ${databasePath}`);

module.exports = db;