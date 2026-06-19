const User = require("../models/User");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const bcrypt = require("bcryptjs");

// Get system stats and recent activity
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalSessions = await Session.countDocuments();

    // Fetch the 5 most recently created sessions
    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalSessions,
      recentActivity: recentSessions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all non-admin users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new user
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role, department, classLevel } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department: department || undefined,
      classLevel: classLevel || undefined
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get analytics data for the admin dashboard
exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    
    // Get today's start and end date
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Present today: count of unique students who marked attendance today
    const presentTodayList = await Attendance.distinct("studentId", {
      date: { $gte: startOfToday, $lte: endOfToday }
    });
    const presentToday = presentTodayList.length;
    const absentToday = totalStudents > 0 ? totalStudents - presentToday : 0;

    // Monthly average calculation
    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    
    // Calculate total possible attendances vs actual attendances in last 30 days
    const totalSessionsLast30Days = await Session.countDocuments({
      date: { $gte: startOfMonth }
    });
    const totalPossibleAttendances = totalSessionsLast30Days * totalStudents;
    
    const actualAttendancesLast30Days = await Attendance.countDocuments({
      date: { $gte: startOfMonth }
    });
    
    let monthlyAvg = 0;
    if (totalPossibleAttendances > 0) {
      monthlyAvg = Math.round((actualAttendancesLast30Days / totalPossibleAttendances) * 100);
    }

    // Calculate Subject-wise aggregate data
    const sessions = await Session.find();
    const subjectMap = {};
    
    for (const session of sessions) {
      if (!subjectMap[session.subject]) {
        subjectMap[session.subject] = { totalHeld: 0, totalAttended: 0 };
      }
      subjectMap[session.subject].totalHeld += totalStudents; // Assuming all students are enrolled in all subjects for this generic stats
    }

    const attendances = await Attendance.find();
    for (const att of attendances) {
      if (subjectMap[att.subject]) {
        subjectMap[att.subject].totalAttended += 1;
      }
    }

    const subjectWiseData = Object.keys(subjectMap).map(subject => {
      const data = subjectMap[subject];
      let attendancePercent = 0;
      if (data.totalHeld > 0) {
        attendancePercent = Math.round((data.totalAttended / data.totalHeld) * 100);
      }
      return { subject, attendance: attendancePercent };
    });

    res.status(200).json({
      totalStudents,
      presentToday,
      absentToday,
      monthlyAvg,
      subjectWiseData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all system-wide session reports
exports.getReports = async (req, res) => {
  try {
    const sessions = await Session.find().populate("teacherId", "name").sort({ date: -1 });
    
    const formattedSessions = sessions.map(session => ({
      _id: session._id,
      branch: session.branch,
      subject: session.subject,
      date: session.date,
      sessionCode: session.sessionCode,
      teacherName: session.teacherId ? session.teacherId.name : "Unknown",
      isActive: session.isActive
    }));

    res.status(200).json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
