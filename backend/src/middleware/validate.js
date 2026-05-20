const { ValidationError } = require('../utils/apiError');

/**
 * Validates request components using Zod schemas
 * @param {object} schemas - Object containing Zod schemas for body, query, and/or params
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Validation failed', formattedErrors));
      }
      next(error);
    }
  };
};

module.exports = validate;
