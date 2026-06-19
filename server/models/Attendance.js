const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  subject: {
    type: String,
  },

  sessionCode: {
    type: String,
  },

  status: {
    type: String,
    default: "Present",
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);