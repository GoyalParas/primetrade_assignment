/**
 * Standardized success API response helper
 */
const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

/**
 * Standardized paginated success API response helper
 */
const paginatedResponse = (res, message, data = [], meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    meta: {
      page: meta.page || 1,
      limit: meta.limit || 10,
      total: meta.total || 0,
      totalPages: meta.totalPages || 0,
    },
  });
};

module.exports = {
  successResponse,
  paginatedResponse,
};
