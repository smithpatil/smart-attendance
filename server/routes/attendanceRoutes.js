const express = require("express");
const router = express.Router();

const {
  createSession,
  markAttendance,
  getStudentAttendance,
  getTeacherAttendance,
  getStudentStats,
  getTeacherStats,
  getSubjectWiseAttendance,
  getDetailedTeacherReport,
  exportBranchAttendanceExcel,
} = require("../controllers/attendanceController");

router.get("/check", (req, res) => {
  res.send("Attendance Route Working");
});

router.post("/create-session", createSession);
router.post("/mark", markAttendance);
router.get("/student/:studentId", getStudentAttendance);
router.get("/teacher/:teacherId", getTeacherAttendance);
router.get("/teacher/:teacherId/detailed-report", getDetailedTeacherReport);
router.get("/teacher/:teacherId/export-excel", exportBranchAttendanceExcel);
router.get("/stats/:studentId", getStudentStats);
router.get("/stats/teacher/:teacherId", getTeacherStats);
router.get("/subject-wise/:studentId", getSubjectWiseAttendance);

module.exports = router;