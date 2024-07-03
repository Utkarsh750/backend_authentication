const express = require("express");
const passport = require("passport");
const {
  userRegistration,
  verifyEmail,
  userLogin,
  getNewAccessToken,
  userProfile,
  userLogout,
  changePassword,
  sendUserPasswordResetEmail,
  userPasswordReset,
} = require("../controller/userController.js");
const accessTokenAutoRefresh = require("../middleware/setAccessTokenAutoRefresh.js");
const router = express.Router();

// Public routes
router.post("/register", userRegistration);
router.post("/verify-email", verifyEmail);
router.post("/login", userLogin);
router.post("/refresh-token", getNewAccessToken);
router.post("/reset-password-link", sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", userPasswordReset);

// Protected routes
router.get(
  "/me",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", {
    session: false,
  }),
  userProfile
);
router.post(
  "/change-password",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", {
    session: false,
  }),
  changePassword
);

router.post(
  "/logout",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", {
    session: false,
  }),
  userLogout
);

module.exports = router;
