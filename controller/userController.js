const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const sendEmailVerificationOTP = require("../utils/sendOTPVerifications.js");
const EmailVerificationModel = require("../models/EmailVerification.js");
const generateTokens = require("../utils/generateTokens.js");
const setTokenCookies = require("../utils/setTokenCookies.js");

// User Registration
const userRegistration = async (req, res) => {
  try {
    // extract from body parameter
    const { name, email, password, password_confirmation } = req.body;

    // check if all fields are provided
    if (!name || !email || !password || !password_confirmation) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    // check if password or conform_password match
    if (password !== password_confirmation) {
      res.status(400).json({
        status: "failed",
        message: "password and confirm password do not match",
      });
    }

    // email verification
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        status: "failed",
        message: "email already exist",
      });
    }

    // generate salt & hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create newUser
    const newUser = await new UserModel({
      name,
      email,
      password: hashedPassword,
    }).save();

    sendEmailVerificationOTP(req, newUser);

    // send success status
    res.status(200).json({
      status: "Success",
      message: "Registration successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to Register, please try again later",
    });
  }
};
// Email Verification
const verifyEmail = async (req, res) => {
  try {
    // extract from req body
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(500).json({
        status: "failed",
        message: "All feilds are required",
      });
    }

    // check if email is exist!
    const existingUser = await UserModel.findOne({ email });

    // check if email doesn't exist
    if (!existingUser) {
      return res.status(404).json({
        status: "failed",
        message: "Email dones't exist",
      });
    }

    // check if email is already verified
    if (existingUser.is_verified) {
      return res.status(404).json({
        status: "failed",
        message: "Email is already verified",
      });
    }

    // check if there is matching email verification OTP
    const emailVerication = await EmailVerificationModel.findOne({
      userId: existingUser._id,
      otp,
    });
    if (!emailVerication) {
      if (!existingUser.is_verified) {
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP, new OTP send to your email",
        });
      }

      const currentTime = new Date();
      const expirationTime = new Date(
        emailVerication.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmailVerificationOTP(req, existingUser);
        res.status(400).json({
          status: "failed",
          message: "OTP expired, new OTP sent to your mail",
        });
      }

      return res.status(400).json({
        status: "failed",
        message: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    const currentTime = new Date();
    const expirationTime = new Date(
      emailVerication.createdAt.getTime() + 15 * 60 * 1000
    );
    if (currentTime > expirationTime) {
      await sendEmailVerificationOTP(req, existingUser);
      return res.status(400).json({
        status: "failed",
        message: "OTP expired, new OTP sent to your email",
      });
    }

    // OTP is valid and not expired, mark email is verified
    existingUser.is_verified = true;
    await existingUser.save();

    // delete email verification document
    await EmailVerificationModel.deleteMany({ userId: existingUser._id });
    res.status(200).json({
      status: "success",
      message: "Email verified succefully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "unable to verify email",
    });
  }
};
// User Login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email and password are required" });
    }
    // Find user by email
    const user = await UserModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid Email or Password" });
    }

    // Check if user exists
    if (!user.is_verified) {
      return res
        .status(401)
        .json({ status: "failed", message: "Your account is not verified" });
    }

    // Compare passwords / Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "failed", message: "Invalid email or password" });
    }

    // Generate tokens
    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(user);

    // Set Cookies
    setTokenCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    );

    // Send success response with tokens
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles[0],
      },
      status: "success",
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_exp: accessTokenExp,
      is_auth: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to login, please try again later",
    });
  }
};
// Get new access token & refresh token
const getNewAccessToken = (req, res) => {
  try {
    // Get New Access Token using refresh token

    // Set New Tokens to Cookie
    setTokenCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to generate new Tokens, please try again",
    });
  }
};

module.exports = { userRegistration, verifyEmail, userLogin };
