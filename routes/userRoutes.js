const express = require("express");
const {
  userRegistration,
  verifyEmail,
  userLogin,
} = require("../controller/userController.js");
const router = express.Router();

// Public routes
router.post("/register", userRegistration);
router.post("/verify-email", verifyEmail);
router.post("/login", userLogin);

module.exports = router;
