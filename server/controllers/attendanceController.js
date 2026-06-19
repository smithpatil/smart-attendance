const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const User = require("../models/User");
const ExcelJS = require("exceljs");

// Helper: Build a regex that matches ONLY the student's own branch aliases
// e.g., "CSE" matches "CSE", "CS", "Computer Science" — but NOT "AIML" or "IT"
function getBranchRegex(department) {
  const dept = (department || "").trim().toLowerCase();
  const branchAliases = {
    cse: ["cse", "cs", "computer science", "computer science and engineering"],
    aiml: ["aiml", "ai", "artificial intelligence", "artificial intelligence and machine learning"],
    it: ["it", "information technology"],
    mechanical: ["mechanical", "mechanical engineering", "mech"],
    civil: ["civil", "civil engineering"],
    electronics: ["electronics", "ece", "electronics and communication", "electronics engineering"],
  };

  // Find which group this department belongs to
  for (const [, aliases] of Object.entries(branchAliases)) {
    if (aliases.some(alias => dept === alias || dept.includes(alias) || alias.includes(dept))) {
      // Build a regex that matches ONLY this group's aliases
      const escaped = aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return new RegExp(`^(${escaped.join('|')})$`, 'i');
    }
  }

  // Fallback: exact match on the department name
  return new RegExp(`^${department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

// Teacher creates a new session
exports.createSession = async (req, res) => {
  try {
    const { teacherId, subject, branch, date } = req.body;

    const sessionCode = "CLASS-" + Math.floor(100000 + Math.random() * 900000);

    const newSession = await Session.create({
      teacherId,
      subject,
      branch,
      date,
      sessionCode,
    });

    // Auto-expire the session in the database after 30 seconds
    setTimeout(async () => {
      try {
        await Session.findByIdAndUpdate(newSession._id, { isActive: false });
      } catch (err) {
        console.error("Failed to auto-expire session", err);
      }
    }, 30000);

    res.status(201).json({
      message: "Session created successfully",
      session: newSession,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Student marks attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId } = req.body;
    const sessionCode = req.body.sessionCode?.trim().toUpperCase();

    // --- CAMPUS WI-FI IP WHITELISTING ---
    const studentIP = req.ip;
    const campusIPsString = process.env.CAMPUS_WIFI_IP;
    
    if (campusIPsString) {
      const allowedIPPrefixes = campusIPsString.split(",").map(ip => ip.trim());
      
      // Clean IPv4 mapped IPv6 addresses if present
      let cleanIP = studentIP;
      if (cleanIP && cleanIP.includes("::ffff:")) {
        cleanIP = cleanIP.split("::ffff:")[1];
      }

      // Check if the student's IP starts with ANY of the allowed prefixes (Subnet matching)
      const isAllowed = allowedIPPrefixes.some(prefix => cleanIP.startsWith(prefix));

      if (!isAllowed) {
        return res.status(403).json({
          message: `Access Denied. Your IP (${cleanIP}) is not on the Campus Wi-Fi network.`,
        });
      }
    }
    // ------------------------------------

    // Security check: Ensure the user marking attendance is actually a student
    const user = await User.findById(studentId);
    if (!user || user.role !== "student") {
      return res.status(403).json({
        message: "Only students can mark attendance.",
      });
    }

    // Verify session exists
    const session = await Session.findOne({ sessionCode });

    if (!session) {
      return res.status(404).json({
        message: "Invalid session code.",
      });
    }

    if (!session.isActive) {
      return res.status(403).json({
        message: "Session code expired. Please ask the teacher for a new one.",
      });
    }

    // Proxy Prevention: Check if session code was generated more than 30 seconds ago
    const sessionAgeInSeconds = (Date.now() - new Date(session.createdAt).getTime()) / 1000;
    if (sessionAgeInSeconds > 30) {
      // Also update it in DB just in case the timeout failed or node restarted
      await Session.findByIdAndUpdate(session._id, { isActive: false });
      return res.status(403).json({
        message: "Session code expired. Please ask the teacher for a new one.",
      });
    }

    // Branch Validation: Ensure the student belongs to the session's branch
    const studentDept = (user.department || "").trim().toLowerCase();
    const sessionBranch = (session.branch || "").trim().toLowerCase();

    if (!studentDept) {
      return res.status(403).json({
        message: "Your profile has no department set. Please contact admin.",
      });
    }

    // Check if student's department matches the session branch
    // Supports exact match, substring match, and common abbreviation mappings
    const branchAliases = {
      cse: ["cse", "cs", "computer science", "computer science and engineering"],
      aiml: ["aiml", "ai", "artificial intelligence", "artificial intelligence and machine learning"],
      it: ["it", "information technology"],
      mechanical: ["mechanical", "mechanical engineering", "mech"],
      civil: ["civil", "civil engineering"],
      electronics: ["electronics", "ece", "electronics and communication", "electronics engineering"],
    };

    // Find which alias group the session branch belongs to
    let sessionAliasGroup = null;
    for (const [key, aliases] of Object.entries(branchAliases)) {
      if (aliases.some(alias => sessionBranch === alias || sessionBranch.includes(alias) || alias.includes(sessionBranch))) {
        sessionAliasGroup = key;
        break;
      }
    }

    // Find which alias group the student department belongs to
    let studentAliasGroup = null;
    for (const [key, aliases] of Object.entries(branchAliases)) {
      if (aliases.some(alias => studentDept === alias || studentDept.includes(alias) || alias.includes(studentDept))) {
        studentAliasGroup = key;
        break;
      }
    }

    // If both resolved to known groups, they must match
    // If either is unknown, fall back to a direct substring check
    const branchMatch = sessionAliasGroup && studentAliasGroup
      ? sessionAliasGroup === studentAliasGroup
      : studentDept.includes(sessionBranch) || sessionBranch.includes(studentDept);

    if (!branchMatch) {
      return res.status(403).json({
        message: `This session is for ${session.branch} students only. Your department (${user.department}) does not match.`,
      });
    }

    const alreadyMarked = await Attendance.findOne({
      studentId,
      sessionCode,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked",
      });
    }

    const attendance = await Attendance.create({
      studentId,
      teacherId: session.teacherId,
      subject: session.subject,
      sessionCode,
    });

    res.status(201).json({
      message: "Attendance Marked Successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get attendance for a specific student (History with Present/Absent)
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 1. Get all sessions for this student's branch only
    const branchRegex = getBranchRegex(student.department);
    const branchSessions = await Session.find({ branch: { $regex: branchRegex } });

    // 2. Get student's marked attendances
    const attendances = await Attendance.find({ studentId });
    const attendedCodes = attendances.map(a => a.sessionCode);

    // 3. Get sessions student attended that might have missed the branch regex (like legacy Data Structures sessions)
    const otherAttendedSessions = await Session.find({ 
      sessionCode: { $in: attendedCodes },
      branch: { $not: branchRegex }
    });

    // 4. Combine and sort
    const allSessions = [...branchSessions, ...otherAttendedSessions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 5. Merge to create a complete history
    const history = allSessions.map(session => ({
      subject: session.subject,
      date: session.date,
      sessionCode: session.sessionCode,
      status: new Set(attendedCodes).has(session.sessionCode) ? "Present" : "Absent"
    }));

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for a teacher's sessions
exports.getTeacherAttendance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    // Find all sessions created by this teacher
    const sessions = await Session.find({ teacherId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance stats for a student
exports.getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student info to find their branch
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 1. Get all sessions matching student's branch only
    const branchRegex = getBranchRegex(student.department);
    const branchSessions = await Session.find({ branch: { $regex: branchRegex } });
    
    // 2. Get all attendances for this student
    const studentAttendances = await Attendance.find({ studentId });
    const attendedSessionCodes = studentAttendances.map(a => a.sessionCode);

    // 3. Get sessions student attended that might have missed the branch regex
    const otherAttendedSessions = await Session.find({ 
      sessionCode: { $in: attendedSessionCodes },
      branch: { $not: branchRegex }
    });

    const totalSessions = branchSessions.length + otherAttendedSessions.length;
    const attendedSessions = studentAttendances.length;

    res.status(200).json({
      totalSessions,
      attendedSessions,
      percentage: totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance stats for a teacher
exports.getTeacherStats = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Total classes today
    const totalClassesToday = await Session.countDocuments({
      teacherId,
      date: today
    });

    // Average Attendance
    // 1. Get all sessions for this teacher
    const sessions = await Session.find({ teacherId });
    if (sessions.length === 0) {
      return res.status(200).json({ totalClassesToday: 0, averageAttendance: 0 });
    }

    let totalAttendancePercentage = 0;

    for (const session of sessions) {
      const attendanceCount = await Attendance.countDocuments({ sessionCode: session.sessionCode });
      
      // Flexible student count for this branch (matching keywords like 'CSE', 'CS', etc.)
      const branchKeywords = session.branch.split(' ').filter(word => word.length >= 2);
      const branchRegex = new RegExp(branchKeywords.join('|'), 'i');

      const studentsInBranch = await User.countDocuments({ 
        role: 'student', 
        department: { $regex: branchRegex } 
      });

      if (studentsInBranch > 0) {
        totalAttendancePercentage += (attendanceCount / studentsInBranch) * 100;
      } else if (attendanceCount > 0) {
        // If we found attendances but no students in branch (legacy data or naming mismatch), 
        // assume 100% for this session to avoid dragging down average
        totalAttendancePercentage += 100;
      }
    }

    const averageAttendance = Math.round(totalAttendancePercentage / sessions.length);

    res.status(200).json({
      totalClassesToday,
      averageAttendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subject-wise attendance for a student
exports.getSubjectWiseAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student to know their branch
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Define initial/default subjects for this student's view
    const defaultSubjects = [
      { name: "DBMS", code: "CS1012", teacher: "Teacher1" },
      { name: "Data Structures", code: "CS1013", teacher: "Teacher1" },
      { name: "Operating Systems", code: "CS1014", teacher: "Teacher1" },
      { name: "Computer Networks", code: "CS1015", teacher: "Teacher1" }
    ];

    const subjectStats = {};

    // Initialize with defaults to show 'zero' even if no sessions/attendances exist
    defaultSubjects.forEach(s => {
      subjectStats[s.name] = {
        subject: s.name,
        teacherName: s.teacher,
        subjectCode: s.code,
        totalHeld: 0,
        totalAttended: 0,
        percentage: 0
      };
    });

    // 1. Get all sessions matching student's branch only
    const branchRegex = getBranchRegex(student.department);

    const branchSessions = await Session.find({ 
      branch: { $regex: branchRegex } 
    }).populate('teacherId', 'name');
    
    // 2. Get student's attendances
    const attendances = await Attendance.find({ studentId });
    const attendedSessionCodes = attendances.map(a => a.sessionCode);

    // 3. Get sessions student attended that might have missed the branch regex
    const otherAttendedSessions = await Session.find({ 
      sessionCode: { $in: attendedSessionCodes },
      branch: { $not: branchRegex }
    }).populate('teacherId', 'name');

    // Combine all relevant sessions
    const sessions = [...branchSessions, ...otherAttendedSessions];

    // 3. Update with real session data
    sessions.forEach(session => {
      const subjectName = session.subject;
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          subject: subjectName,
          teacherName: session.teacherId?.name || "Unknown Teacher",
          subjectCode: subjectName.toUpperCase().substring(0, 3) + "101",
          totalHeld: 0,
          totalAttended: 0,
          percentage: 0
        };
      } else if (session.teacherId) {
        // Update teacher name from session if it exists
        subjectStats[subjectName].teacherName = session.teacherId.name;
      }
      subjectStats[subjectName].totalHeld += 1;
    });

    // 4. Update with real attendance data
    attendances.forEach(att => {
      if (subjectStats[att.subject]) {
        subjectStats[att.subject].totalAttended += 1;
      }
    });

    // Calculate final percentages
    const result = Object.values(subjectStats).map(stat => ({
      ...stat,
      percentage: stat.totalHeld > 0 ? Math.round((stat.totalAttended / stat.totalHeld) * 100) : 0
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed branch-wise attendance for a teacher
exports.getDetailedTeacherReport = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // 1. Get all sessions created by this teacher
    const sessions = await Session.find({ teacherId });
    
    if (sessions.length === 0) {
      return res.status(200).json({});
    }

    // 2. Group sessions by exact branch string
    const branches = {};
    sessions.forEach(session => {
      if (!session.branch) return; // Skip if no branch
      const branchName = session.branch;
      if (!branches[branchName]) {
        branches[branchName] = {
          sessions: [],
          sessionCodes: []
        };
      }
      branches[branchName].sessions.push(session);
      branches[branchName].sessionCodes.push(session.sessionCode);
    });

    const detailedReport = {};

    // 3. For each branch, find students and calculate their attendance
    for (const [branchName, branchData] of Object.entries(branches)) {
      // Use the proper branch alias resolver to match only the correct branch
      const branchRegex = getBranchRegex(branchName);
      
      const students = await User.find({ 
        role: "student",
        department: { $regex: branchRegex }
      });

      const studentsList = [];

      for (const student of students) {
        // How many of these branch sessions did this student attend?
        const attendedCount = await Attendance.countDocuments({
          studentId: student._id,
          sessionCode: { $in: branchData.sessionCodes }
        });

        const totalCount = branchData.sessionCodes.length;

        studentsList.push({
          id: student._id,
          name: student.name,
          rollNo: student.rollNo || "N/A",
          attendedCount,
          totalCount,
          percentage: totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0
        });
      }

      // Sort students alphabetically
      studentsList.sort((a, b) => a.name.localeCompare(b.name));

      detailedReport[branchName] = {
        sessions: branchData.sessions,
        students: studentsList
      };
    }

    res.status(200).json(detailedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export attendance data as Excel
// Supports ?mode=combined (single sheet, all branches) or default branchwise (one sheet per branch)
exports.exportBranchAttendanceExcel = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { mode } = req.query; // "combined" or default (branchwise)

    // 1. Get all sessions created by this teacher
    const sessions = await Session.find({ teacherId });

    if (sessions.length === 0) {
      return res.status(404).json({ message: "No sessions found" });
    }

    // 2. Group sessions by branch
    const branches = {};
    sessions.forEach(session => {
      if (!session.branch) return;
      const branchName = session.branch;
      if (!branches[branchName]) {
        branches[branchName] = {
          sessions: [],
          sessionCodes: []
        };
      }
      branches[branchName].sessions.push(session);
      branches[branchName].sessionCodes.push(session.sessionCode);
    });

    // 3. Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SmartAttend";
    workbook.created = new Date();

    // Color palette
    const primaryColor = "4F46E5";
    const headerBg = "EEF2FF";
    const successColor = "059669";
    const warningColor = "D97706";
    const borderColor = "E5E7EB";

    // Helper: style a header row
    const styleHeader = (row) => {
      row.height = 28;
      row.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF374151" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + headerBg } };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = { bottom: { style: "medium", color: { argb: "FF" + primaryColor } } };
      });
    };

    // Helper: style a data row
    const styleDataRow = (row, idx, student, percentageCol) => {
      row.height = 24;
      const rowBg = idx % 2 === 0 ? "FFFFFFFF" : "FFF9FAFB";
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Segoe UI", size: 10, color: { argb: "FF1F2937" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = { bottom: { style: "thin", color: { argb: "FF" + borderColor } } };

        if (colNumber === percentageCol) {
          cell.value = `${student.percentage}%`;
          cell.font = {
            name: "Segoe UI", size: 10, bold: true,
            color: { argb: student.percentage >= 75 ? "FF" + successColor : "FF" + warningColor }
          };
        }
      });
    };

    // Helper: style a summary row
    const styleSummary = (row) => {
      row.height = 28;
      row.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF" + primaryColor } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + headerBg } };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = { top: { style: "medium", color: { argb: "FF" + primaryColor } } };
      });
    };

    // Helper: fetch students for a branch
    const fetchBranchStudents = async (branchName, branchData) => {
      const branchRegex = getBranchRegex(branchName);
      const students = await User.find({ role: "student", department: { $regex: branchRegex } });
      const studentsList = [];

      for (const student of students) {
        const attendedCount = await Attendance.countDocuments({
          studentId: student._id,
          sessionCode: { $in: branchData.sessionCodes }
        });
        const totalCount = branchData.sessionCodes.length;
        studentsList.push({
          name: student.name,
          rollNo: student.rollNo || "N/A",
          branch: branchName,
          attendedCount,
          totalCount,
          percentage: totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0
        });
      }

      studentsList.sort((a, b) => a.name.localeCompare(b.name));
      return studentsList;
    };

    if (mode === "combined") {
      // ========== COMBINED MODE: single sheet with all branches ==========
      const sheet = workbook.addWorksheet("All Branches", {
        properties: { defaultColWidth: 18 },
      });

      // Title
      sheet.mergeCells("A1:F1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = "Attendance Report — All Branches";
      titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF" + primaryColor } };
      titleCell.alignment = { vertical: "middle", horizontal: "left" };
      sheet.getRow(1).height = 36;

      // Meta
      sheet.mergeCells("A2:F2");
      const metaCell = sheet.getCell("A2");
      metaCell.value = `Generated on ${new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      })}  •  Total Sessions: ${sessions.length}  •  Branches: ${Object.keys(branches).join(", ")}`;
      metaCell.font = { name: "Segoe UI", size: 10, color: { argb: "FF6B7280" } };
      metaCell.alignment = { vertical: "middle" };
      sheet.getRow(2).height = 22;

      sheet.addRow([]);

      // Header with Branch column
      const headerRow = sheet.addRow(["#", "Student Name", "Roll No", "Branch", "Classes Attended", "Attendance %"]);
      styleHeader(headerRow);

      sheet.getColumn(1).width = 6;
      sheet.getColumn(2).width = 28;
      sheet.getColumn(3).width = 16;
      sheet.getColumn(4).width = 18;
      sheet.getColumn(5).width = 22;
      sheet.getColumn(6).width = 18;

      // Gather all students from all branches
      let allStudents = [];
      for (const [branchName, branchData] of Object.entries(branches)) {
        const students = await fetchBranchStudents(branchName, branchData);
        allStudents = allStudents.concat(students);
      }

      allStudents.sort((a, b) => a.branch.localeCompare(b.branch) || a.name.localeCompare(b.name));

      // Data rows
      allStudents.forEach((student, idx) => {
        const row = sheet.addRow([
          idx + 1,
          student.name,
          student.rollNo,
          student.branch,
          `${student.attendedCount} / ${student.totalCount}`,
          student.percentage
        ]);
        styleDataRow(row, idx, student, 6);
      });

      // Summary
      sheet.addRow([]);
      const avgPercentage = allStudents.length > 0
        ? Math.round(allStudents.reduce((sum, s) => sum + s.percentage, 0) / allStudents.length)
        : 0;
      const summaryRow = sheet.addRow(["", "Total Students", allStudents.length, "", "Avg. Attendance", `${avgPercentage}%`]);
      styleSummary(summaryRow);

    } else {
      // ========== BRANCHWISE MODE: one sheet per branch ==========
      for (const [branchName, branchData] of Object.entries(branches)) {
        const sheetName = branchName.replace(/[\\/*?:\[\]]/g, "").substring(0, 31);
        const sheet = workbook.addWorksheet(sheetName, {
          properties: { defaultColWidth: 18 },
        });

        // Title
        sheet.mergeCells("A1:E1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = `${branchName} — Attendance Report`;
        titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF" + primaryColor } };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };
        sheet.getRow(1).height = 36;

        // Meta
        sheet.mergeCells("A2:E2");
        const metaCell = sheet.getCell("A2");
        metaCell.value = `Generated on ${new Date().toLocaleDateString("en-IN", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        })}  •  Total Sessions: ${branchData.sessions.length}`;
        metaCell.font = { name: "Segoe UI", size: 10, color: { argb: "FF6B7280" } };
        metaCell.alignment = { vertical: "middle" };
        sheet.getRow(2).height = 22;

        sheet.addRow([]);

        // Header
        const headerRow = sheet.addRow(["#", "Student Name", "Roll No", "Classes Attended", "Attendance %"]);
        styleHeader(headerRow);

        sheet.getColumn(1).width = 6;
        sheet.getColumn(2).width = 28;
        sheet.getColumn(3).width = 16;
        sheet.getColumn(4).width = 22;
        sheet.getColumn(5).width = 18;

        const studentsList = await fetchBranchStudents(branchName, branchData);

        // Data rows
        studentsList.forEach((student, idx) => {
          const row = sheet.addRow([
            idx + 1,
            student.name,
            student.rollNo,
            `${student.attendedCount} / ${student.totalCount}`,
            student.percentage
          ]);
          styleDataRow(row, idx, student, 5);
        });

        // Summary
        sheet.addRow([]);
        const avgPercentage = studentsList.length > 0
          ? Math.round(studentsList.reduce((sum, s) => sum + s.percentage, 0) / studentsList.length)
          : 0;
        const summaryRow = sheet.addRow(["", "Total Students", studentsList.length, "Avg. Attendance", `${avgPercentage}%`]);
        styleSummary(summaryRow);
      }
    }

    // 4. Send response
    const fileName = mode === "combined"
      ? `Attendance_All_${new Date().toISOString().split("T")[0]}.xlsx`
      : `Attendance_Branchwise_${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ message: error.message });
  }
};