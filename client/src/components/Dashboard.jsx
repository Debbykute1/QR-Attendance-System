import { useEffect, useState } from "react";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const loadDashboard = async () => {
    try {
      setError("");
      setLoading(true);

      const [studentsResponse, attendanceResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/students`),
          fetch(`${API_URL}/api/attendance`),
        ]);

      const studentsData = await studentsResponse.json();
      const attendanceData = await attendanceResponse.json();

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.message || "Failed to load students"
        );
      }

      if (!attendanceResponse.ok) {
        throw new Error(
          attendanceData.message ||
            "Failed to load attendance"
        );
      }

      setStudents(studentsData);
      setAttendance(attendanceData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Get local date in YYYY-MM-DD format
  const getLocalDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getLocalDate();

  const todayAttendance = attendance.filter(
    (record) =>
      record.attendance_date === today
  );

  const totalStudents = students.length;

  const presentToday = todayAttendance.length;

  const absentToday = Math.max(
    totalStudents - presentToday,
    0
  );

  const attendancePercentage =
    totalStudents > 0
      ? Math.round(
          (presentToday / totalStudents) * 100
        )
      : 0;

  if (loading) {
    return (
      <section className="dashboard">
        <div className="card loading-card">
          <p>Loading dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard">

      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p>
            Attendance overview for {today}
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            👨‍🎓
          </div>

          <div>
            <p>Total Students</p>
            <h3>{totalStudents}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ✅
          </div>

          <div>
            <p>Present Today</p>
            <h3>{presentToday}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ❌
          </div>

          <div>
            <p>Absent Today</p>
            <h3>{absentToday}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            📊
          </div>

          <div>
            <p>Attendance Rate</p>
            <h3>{attendancePercentage}%</h3>
          </div>
        </div>

      </div>

      <div className="card recent-attendance">

        <h2>Recent Attendance</h2>

        {attendance.length === 0 ? (
          <p>
            No attendance records yet.
          </p>
        ) : (
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>

                {attendance
                  .slice(0, 5)
                  .map((record) => (
                    <tr key={record.id}>

                      <td>
                        {record.student_id}
                      </td>

                      <td>
                        {record.name}
                      </td>

                      <td>
                        {record.department || "-"}
                      </td>

                      <td>
                        {record.attendance_date}
                      </td>

                      <td>
                        {record.attendance_time}
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </section>
  );
}

export default Dashboard;