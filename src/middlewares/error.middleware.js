const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let details = err.details || null;

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
      message = `A record with this ${target} already exists.`;
      details = [{ field: target, message }];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = err.meta?.cause || 'Record not found';
    } else if (err.code === 'P2003') {
      statusCode = 409;
      code = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
      message = 'Operation failed due to related records constraint.';
    }
  }

  // Handle SyntaxError (JSON body parsing)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  // Handle JWT errors if thrown directly
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  const response = {
    success: false,
    message,
    error: {
      code,
    },
  };

  if (details && details.length > 0) {
    response.error.details = details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
