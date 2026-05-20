const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/db');
const { UnauthorizedError } = require('../utils/apiError');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Authentication token is required');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      // Verify user still exists in the database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedError('User associated with this token no longer exists');
      }

      // Attach user payload to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token has expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
