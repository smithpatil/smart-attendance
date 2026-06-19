const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  changePassword,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", changePassword);
router.put("/profile", updateProfile);

module.exports = router;