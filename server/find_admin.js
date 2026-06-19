const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb+srv://smith:Smith123@cluster0.ionquz7.mongodb.net/attendanceDB?appName=Cluster0")
  .then(async () => {
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log("Admin found:", admin.email);
    } else {
      console.log("No admin found");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
