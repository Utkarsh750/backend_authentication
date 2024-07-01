const isTokenExpired = require("../utils/isTokenExpired");

// This middleware will set Authorisation Header
const setAuthHeader = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken || !isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    next();
  } catch (error) {
    console.error("Error adding access to the token", error.message);
  }
};

module.exports = setAuthHeader;
