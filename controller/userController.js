const bcrypt = require("bcrypt");
const UserModel = require("../models/User");

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

module.exports = userRegistration;