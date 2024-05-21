const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  roles: {
    type: [String],
    enum: ["user", "admin"],
    default: ["user"],
  },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
