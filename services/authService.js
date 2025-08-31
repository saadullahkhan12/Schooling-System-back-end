const jwt = require('jsonwebtoken'); // Missing import added
const { JWT_SECRET } = require('../config/env');

exports.generateToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role
      // Add any other user data you want in the token payload
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};