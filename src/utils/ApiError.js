class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null, code = 'BAD_REQUEST') {
    return new ApiError(400, message, code, details);
  }

  static validation(message = 'Validation failed', details = []) {
    return new ApiError(400, message, 'VALIDATION_ERROR', details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message = 'Conflict occurred', code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR') {
    return new ApiError(500, message, code);
  }
}

module.exports = ApiError;
