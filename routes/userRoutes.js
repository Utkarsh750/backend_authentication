const express = require("express");
const userRegistration = require("../controller/userController");
const router = express.Router();

// Public routes
router.post("/register", userRegistration);

module.exports = router;
