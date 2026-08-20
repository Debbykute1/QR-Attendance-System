import { useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import QRScanner from "./components/QRScanner";
import StudentsList from "./components/StudentsList";
import AttendanceList from "./components/AttendanceList";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    email: "",
    department: "",
  });

  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setStudent(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to register student"
        );
      }

      setStudent(data.student);
      setMessage("Student registered successfully!");

      setFormData({
        student_id: "",
        name: "",
        email: "",
        department: "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "register":
        return (
          <div className="page-content">
            <section className="card registration-card">
              <h2>Register Student</h2>

              {message && (
                <div className="success">
                  {message}
                </div>
              )}

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label>Student ID</label>

                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="e.g. STU002"
                  required
                />

                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter student's full name"
                  required
                />

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                />

                <label>Department</label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />

                <button type="submit">
                  Register Student
                </button>
              </form>
            </section>

            {student && (
              <section className="card qr-card">
                <h2>Student QR Code</h2>

                <div className="student-info">
                  <p>
                    <strong>Name:</strong>{" "}
                    {student.name}
                  </p>

                  <p>
                    <strong>Student ID:</strong>{" "}
                    {student.student_id}
                  </p>

                  <p>
                    <strong>Department:</strong>{" "}
                    {student.department || "Not provided"}
                  </p>
                </div>

                <div className="qr-print-area">
                  <img
                    src={student.qr_code}
                    alt={`QR code for ${student.name}`}
                    className="qr-code"
                  />

                  <div className="qr-student-details">
                    <h3>{student.name}</h3>

                    <p>
                      <strong>Student ID:</strong>{" "}
                      {student.student_id}
                    </p>

                    <p>
                      <strong>Department:</strong>{" "}
                      {student.department || "Not provided"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="print-qr-button"
                    onClick={() => window.print()}
                  >
                    🖨️ Print QR Code
                  </button>

                  <p className="qr-message">
                    Save or print this QR code for attendance
                    scanning.
                  </p>
                </div>
              </section>
            )}
          </div>
        );

      case "scan":
        return (
          <div className="page-content single-page">
            <QRScanner />
          </div>
        );

      case "students":
        return (
          <div className="page-content single-page">
            <StudentsList />
          </div>
        );

      case "attendance":
        return (
          <div className="page-content single-page">
            <AttendanceList />
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">QR</div>

          <div>
            <h2>Attendance</h2>
            <span>Management System</span>
          </div>
        </div>

        <nav className="navigation">

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("dashboard")}
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "register"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("register")}
          >
            <span>👨‍🎓</span>
            Register Student
          </button>

          <button
            className={
              activePage === "scan"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("scan")}
          >
            <span>📷</span>
            Scan Attendance
          </button>

          <button
            className={
              activePage === "students"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("students")}
          >
            <span>👥</span>
            Students
          </button>

          <button
            className={
              activePage === "attendance"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("attendance")}
          >
            <span>📋</span>
            Attendance
          </button>

        </nav>

        <div className="sidebar-footer">
          <p>QR Attendance System</p>
          <small>Version 1.0</small>
        </div>

      </aside>

      {/* Main Area */}
      <div className="main-area">

        <header className="topbar">
          <div>
            <h1>QR Attendance System</h1>
            <p>
              Student Registration & Attendance Management
            </p>
          </div>
        </header>

        <main className="content">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

export default App;