const express = require("express");
const {userRegistration, verifyEmail} = require("../controller/userController.js");
const router = express.Router();

// Public routes
router.post("/register", userRegistration);
router.post("/verify-email",verifyEmail);

module.exports = router;
