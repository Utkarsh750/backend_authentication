const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Admin Gmail ID
    pass: process.env.EMAIL_PASS, // Admin Gmail Password
  },
});

module.exports = transporter;
