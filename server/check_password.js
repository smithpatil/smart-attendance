const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect("mongodb+srv://smith:Smith123@cluster0.ionquz7.mongodb.net/attendanceDB?appName=Cluster0")
  .then(async () => {
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      const p1 = await bcrypt.compare("admin123", admin.password);
      const p2 = await bcrypt.compare("admin@123", admin.password);
      const p3 = await bcrypt.compare("password", admin.password);
      const p4 = await bcrypt.compare("123456", admin.password);
      
      if(p1) console.log("Password is: admin123");
      else if(p2) console.log("Password is: admin@123");
      else if(p3) console.log("Password is: password");
      else if(p4) console.log("Password is: 123456");
      else console.log("Password is unknown, hash is:", admin.password);
    } else {
      console.log("No admin found");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
