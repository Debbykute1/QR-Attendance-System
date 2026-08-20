import { useEffect, useState } from "react";

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/students`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load students"
        );
      }

      setStudents(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.student_id
        ?.toLowerCase()
        .includes(searchText) ||
      student.name
        ?.toLowerCase()
        .includes(searchText) ||
      student.email
        ?.toLowerCase()
        .includes(searchText) ||
      student.department
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const handleViewQR = (student) => {
    setSelectedStudent(student);
  };

  const closeQR = () => {
    setSelectedStudent(null);
  };

  const printQR = () => {
    window.print();
  };

  return (
    <>
      <section className="card full-width">

        <div className="section-header">
          <div>
            <h2>Students</h2>

            <p>
              Registered students: {students.length}
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadStudents}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by ID, name, email or department..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-card">
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>
              {students.length === 0
                ? "No students have been registered yet."
                : "No students match your search."}
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
                  <th>Email</th>
                  <th>Department</th>
                  <th>QR Code</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(
                  (student, index) => (
                    <tr key={student.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {student.student_id}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {student.name}
                        </strong>
                      </td>

                      <td>
                        {student.email || "-"}
                      </td>

                      <td>
                        {student.department || "-"}
                      </td>

                      <td>
                        <button
                          className="view-qr-button"
                          onClick={() =>
                            handleViewQR(student)
                          }
                        >
                          📱 View QR
                        </button>
                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* QR MODAL */}

      {selectedStudent && (
        <div
          className="qr-modal"
          onClick={closeQR}
        >

          <div
            className="qr-modal-content qr-print-area"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-modal"
              onClick={closeQR}
            >
              ×
            </button>

            <h2>Student QR Code</h2>

            <div className="student-qr-info">

              <h3>
                {selectedStudent.name}
              </h3>

              <p>
                <strong>Student ID:</strong>{" "}
                {selectedStudent.student_id}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {selectedStudent.department || "-"}
              </p>

            </div>

            {selectedStudent.qr_code ? (
              <img
                src={selectedStudent.qr_code}
                alt={`QR Code for ${selectedStudent.name}`}
                className="large-qr-code"
              />
            ) : (
              <p className="error">
                QR code is not available for this student.
              </p>
            )}

            <p className="qr-instruction">
              This QR code can be used to record
              attendance.
            </p>

            <div className="qr-actions">

              <button
                className="print-qr-button"
                onClick={printQR}
              >
                🖨️ Print QR Code
              </button>

              <button
                className="cancel-button"
                onClick={closeQR}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default StudentsList;