const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');
const UserModel = require('../models/User');
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY
}

passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
  try {
    const user = await UserModel.findOne({ _id: jwt_payload._id }).select('-password')
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }

  } catch (error) {
    return done(err, false);
  }
}));

