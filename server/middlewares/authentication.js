const jwt = require('jsonwebtoken');
const { STATUSCODE } = require('../constants');
const { createCustomError } = require('../utils/errorHandler');

const authenticationMiddleware = async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createCustomError('Authentication invalid', STATUSCODE.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  const isBlacklisted = await BlacklistedToken.findOne({ token });
  if (isBlacklisted) {
    throw new UnauthenticatedError('Token revoked');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(createCustomError('Authentication invalid', STATUSCODE.UNAUTHORIZED));
  }
};

module.exports = authenticationMiddleware;