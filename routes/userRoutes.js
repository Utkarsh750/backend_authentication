const express = require("express");
const passport = require("passport");
const {
  userRegistration,
  verifyEmail,
  userLogin,
  getNewAccessToken,
  userProfile,
} = require("../controller/userController.js");
const router = express.Router();

// Public routes
router.post("/register", userRegistration);
router.post("/verify-email", verifyEmail);
router.post("/login", userLogin);
router.post("/refresh-token", getNewAccessToken);

// Protected routes
router.get(
  "/me",
  passport.authenticate("jwt", {
    session: false,
  }),
  userProfile
);

module.exports = router;
