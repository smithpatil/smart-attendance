const mongoose = require('mongoose');
const User = require('./models/User');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({});
        console.log("\n--- USERS ---");
        users.forEach(u => console.log(`${u._id} | ${u.name} | ${u.role} | ${u.department}`));

        const sessions = await Session.find({});
        console.log("\n--- SESSIONS ---");
        sessions.forEach(s => console.log(`${s.sessionCode} | ${s.subject} | ${s.branch} | ${s.date}`));

        const attendances = await Attendance.find({});
        console.log("\n--- ATTENDANCES ---");
        attendances.forEach(a => console.log(`Student: ${a.studentId} | Code: ${a.sessionCode} | Subject: ${a.subject}`));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkData();
