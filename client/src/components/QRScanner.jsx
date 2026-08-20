import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
  const scannerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const startScanner = async () => {
    setMessage("");
    setError("");

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await handleScan(decodedText);

          try {
            await scanner.stop();
            await scanner.clear();
          } catch (stopError) {
            console.error(stopError);
          }

          setScanning(false);
        },
        () => {
          // Ignore unsuccessful scans while camera is searching.
        }
      );

      setScanning(true);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to access the camera. Please allow camera permission and try again."
      );
    }
  };

  const handleScan = async (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);

      if (!qrData.student_id) {
        throw new Error("Invalid student QR code.");
      }

      const response = await fetch(
        `${API_URL}/api/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: qrData.student_id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to record attendance."
        );
      }

      setMessage(
        `Attendance recorded for ${data.attendance.name} at ${data.attendance.attendance_time}`
      );

      setError("");
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  return (
    <section className="card">
      <h2>Scan Attendance</h2>

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

      <div
        id="qr-reader"
        style={{ width: "100%" }}
      ></div>

      {!scanning && (
        <button onClick={startScanner}>
          Start QR Scanner
        </button>
      )}

      {scanning && (
        <p className="scanner-status">
          Camera is active. Point it at a
          student's QR code.
        </p>
      )}
    </section>
  );
}

export default QRScanner;