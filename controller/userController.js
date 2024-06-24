const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const sendEmailVerificationOTP = require("../utils/sendOTPVerifications");
const EmailVerificationModel = require("../models/EmailVerification");

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

module.exports = { userRegistration, verifyEmail };
