import { useEffect, useState } from "react";

function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/attendance`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load attendance"
        );
      }

      setAttendance(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const filteredAttendance = attendance.filter(
    (record) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        record.student_id
          ?.toLowerCase()
          .includes(searchText) ||
        record.name
          ?.toLowerCase()
          .includes(searchText) ||
        record.department
          ?.toLowerCase()
          .includes(searchText);

      const matchesDate =
        !date ||
        record.attendance_date === date;

      return matchesSearch && matchesDate;
    }
  );

  const exportCSV = () => {
    if (filteredAttendance.length === 0) {
      alert("There are no attendance records to export.");
      return;
    }

    const headers = [
      "Student ID",
      "Name",
      "Department",
      "Date",
      "Time",
    ];

    const rows = filteredAttendance.map((record) => [
      record.student_id || "",
      record.name || "",
      record.department || "",
      record.attendance_date || "",
      record.attendance_time || "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `attendance-${date || "all"}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <section className="card full-width">

      <div className="section-header">
        <div>
          <h2>Attendance Records</h2>

          <p>
            Records found:{" "}
            {filteredAttendance.length}
          </p>
        </div>

        <div className="header-buttons">

          <button
            className="export-button"
            onClick={exportCSV}
          >
            📥 Export CSV
          </button>

          <button
            className="refresh-button"
            onClick={loadAttendance}
          >
            🔄 Refresh
          </button>

        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Filters */}

      <div className="attendance-filters">

        <div className="filter-group">
          <label>Search</label>

          <input
            type="text"
            placeholder="Student ID, name or department"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="filter-group">
          <label>Filter by Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </div>

        <button
          className="clear-filter"
          onClick={() => {
            setSearch("");
            setDate("");
          }}
        >
          Clear Filters
        </button>

      </div>

      {/* Table */}

      {loading ? (
        <div className="loading-card">
          <p>Loading attendance records...</p>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <div className="empty-state">
          <p>
            No attendance records found.
          </p>
        </div>
      ) : (
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.map(
                (record, index) => (
                  <tr key={record.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      <strong>
                        {record.student_id}
                      </strong>
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
                )
              )}
            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}

export default AttendanceList;