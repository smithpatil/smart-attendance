import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function QRScanner() {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = () => {
    setIsScannerActive(true);
    setStatusMessage("");
  };

  const stopScanner = () => {
    setIsScannerActive(false);
  };

  useEffect(() => {
    if (isScannerActive) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      let isProcessing = false;

      html5QrCode.start(
        { facingMode: "environment" }, // Force back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          if (isProcessing) return;
          isProcessing = true;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              setStatusType("error");
              setStatusMessage("User not authenticated.");
              return;
            }

            const decoded: any = jwtDecode(token);
            const studentId = decoded.id;

            await axios.post(`/api/attendance/mark`, {
              studentId,
              sessionCode: decodedText
            });

            stopScanner();
            navigate("/student", { state: { successMessage: "Attendance marked successfully!" } });
          } catch (error: any) {
            setStatusType("error");
            setStatusMessage(error.response?.data?.message || "Failed to mark attendance.");
            setTimeout(() => { isProcessing = false; }, 3000);
          }
        },
        () => {
          // Continuous scanning — no-op on error
        }
      ).catch(err => {
        console.error("Camera start failed", err);
        setStatusType("error");
        setStatusMessage("Failed to start camera. Please ensure camera permissions are granted.");
        setIsScannerActive(false);
      });
    }

    return () => {
      if (scannerRef.current) {
        try {
          // If the scanner hasn't fully started yet, stop() might throw a sync error
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          }).catch(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
        } catch (error) {
          try { scannerRef.current?.clear(); } catch (e) {}
          scannerRef.current = null;
        }
      }
    };
  }, [isScannerActive, navigate]);

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />
      <div className="p-4 flex-1 w-full flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Scan QR</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Position the QR code within the camera frame</p>
        </div>

        {statusMessage && (
          <div className={`mb-5 p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${
            statusType === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
              : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
          }`}>
            {statusType === 'success' ? (
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {!isScannerActive ? (
            <button onClick={startScanner} className="w-48 h-48 rounded-full bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 border-dashed flex flex-col items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Tap to Scan</span>
            </button>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="card p-3 w-full overflow-hidden shadow-xl shadow-primary-500/10">
                <div id="reader" className="w-full text-gray-900 dark:text-white rounded-lg overflow-hidden [&_video]:rounded-lg [&_video]:w-full [&_video]:object-cover"></div>
              </div>
              <button
                onClick={stopScanner}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors shadow-lg shadow-red-500/10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Scanner
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav role="student" />
    </div>
  );
}