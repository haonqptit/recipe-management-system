const ApiError = require('../utils/ApiError');

const validate = (validatorFn) => (req, res, next) => {
  const errors = validatorFn(req);
  if (errors && errors.length > 0) {
    return next(ApiError.validation('Validation failed', errors));
  }
  next();
};

module.exports = validate;
