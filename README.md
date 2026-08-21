# QR Attendance Management System

A web-based QR Attendance Management System built with React, Vite, Node.js, Express, and SQLite.

The system allows administrators or lecturers to register students, generate unique QR codes, scan QR codes to record attendance, and view student and attendance records.

## Features

- 📊 Dashboard with attendance overview
- 👨‍🎓 Student registration
- 📱 QR code generation for registered students
- 📷 QR code attendance scanning
- 👥 Student management
- 📋 Attendance records
- ✅ Present and absent attendance tracking
- 🔄 Refresh attendance data
- 💾 SQLite database for storing student and attendance information

## Technologies Used

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- CORS

### Database

- SQLite

### Other

- QR Code generation
- QR Code scanning

## Project Structure

```text
QR-Attendance-System/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── database/
│   │   ├── db.js
│   │   └── attendance.db
│   ├── routes/
│   ├── index.js
│   └── package.json
│
└── README.md