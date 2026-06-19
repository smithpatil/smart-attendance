const express = require("express");
const router = express.Router();

const {
  getStats,
  getUsers,
  addUser,
  deleteUser,
  getAnalytics,
  getReports
} = require("../controllers/adminController");

router.get("/stats", getStats);
router.get("/users", getUsers);
router.post("/users", addUser);
router.delete("/users/:id", deleteUser);
router.get("/analytics", getAnalytics);
router.get("/reports", getReports);

module.exports = router;
