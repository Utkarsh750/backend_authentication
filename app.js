const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
const userRoutes = require("./routes/userRoutes.js");
require("./config/passport-jwt-strategy.js");

const DATABASE_URL = process.env.DATABASE_URL;

// for cors policy error
const corsOptions = {
  origin: process.env.FRONTEND_HOST,
  credentials: true,
  optionsSuccessStatus: 200,
};

// CORS middleware
app.use(cors(corsOptions));

// express middleware
app.use(express.json());

// COOKIE_PARSER middleware
app.use(cookieParser());

// passport middleware
app.use(passport.initialize());

// load routes
app.use("/api/user", userRoutes);

connectDB(DATABASE_URL);

app.listen(port, (req, res) => {
  console.log(`Server is running on ${port}`);
});
