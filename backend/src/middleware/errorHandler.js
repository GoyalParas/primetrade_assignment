const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Prisma unique constraint error (e.g. email already exists)
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Resource already exists';
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    errors = [{ field: target, message: `This ${target} is already in use` }];
  }

  // Handle Prisma record not found error
  if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Record not found';
  }

  // Log error (errors are logged at error level if 500, else warn level)
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, {
      stack: err.stack,
      errors,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, { errors });
  }

  // Response structure matching implementation plan
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;
