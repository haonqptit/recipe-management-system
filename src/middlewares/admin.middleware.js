const ApiError = require('../utils/ApiError');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required', 'UNAUTHORIZED'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(ApiError.forbidden('Admin privilege required', 'FORBIDDEN'));
  }

  next();
};

module.exports = {
  requireAdmin,
};
