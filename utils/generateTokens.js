const jwt = require("jsonwebtoken");

const generateTokens = async (req, res) => {
  try {
    const payload = { _id: user._id, roles: user.roles };

    // Generate access token with expire times
    const accessTokensExp = Math.floor(Date.now() / 1000) + 100; // set expiration to 100 seconds from now

    const accessTokens = jwt.sign(
      {
        ...payload,
        exp: accessTokensExp,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    //   Generate refresh token with expiration time
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // set expiration to 100 seconds from now

    const refreshTokens = jwt.sign(
      {
        ...payload,
        exp: accessTokensExp,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    return Promise.resolve({
      accessTokens,
      accessTokensExp,
      refreshTokens,
      refreshTokenExp,
    });
  } catch (error) {}
};
