const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    required: true,
  },

  department: {
    type: String,
  },

  semester: {
    type: String,
  },

  deviceId: {
    type: String,
  },

  division: {
    type: String,
  },

  classLevel: {
    type: String,
  },

  rollNo: {
    type: String,
  },

  phoneNo: {
    type: String,
  },

  address: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);