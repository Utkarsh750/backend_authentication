const UserRefreshTokenModel = require("../models/userRefreshTokens");
const VerifyRefreshToken = require("./verifyRefreshToken");

const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    // Verify Refresh Token is valid or not
    const { tokenDetails, error } = await VerifyRefreshToken(oldRefreshToken);

    if (error) {
      return res
        .status(401)
        .send({ status: "failed", message: "Invalid refresh token" });
    }
    // Find User based on Refresh Token detail id
    const user = await UserModel.findById(tokenDetails._id);

    if (!user) {
      return res
        .status(404)
        .send({ status: "failed", message: "User not found" });
    }

    const userRefreshToken = await UserRefreshTokenModelel.findOne({
      userId: tokenDetails._id,
    });

    if (
      oldRefreshToken !== userRefreshToken.token ||
      userRefreshToken.blacklisted
    ) {
      return res
        .status(401)
        .send({ status: "failed", message: "Unauthorized access" });
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(user);
    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "failed", message: "Internal server error" });
  }
};

module.exports = refreshAccessToken