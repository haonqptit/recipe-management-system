const validateIdParam = (req) => {
  const errors = [];
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    errors.push({ field: 'id', message: 'Review ID must be a positive integer' });
  }
  return errors;
};

const validateRecipeIdParam = (req) => {
  const errors = [];
  const recipeId = parseInt(req.params.recipeId, 10);
  if (isNaN(recipeId) || recipeId <= 0) {
    errors.push({ field: 'recipeId', message: 'Recipe ID must be a positive integer' });
  }
  return errors;
};

const validateCreateReview = (req) => {
  const errors = [];
  const { recipeId, rating, comment } = req.body || {};

  const rId = parseInt(recipeId, 10);
  if (isNaN(rId) || rId <= 0) {
    errors.push({ field: 'recipeId', message: 'recipeId must be a positive integer' });
  }

  const rate = parseInt(rating, 10);
  if (isNaN(rate) || rate < 1 || rate > 5) {
    errors.push({ field: 'rating', message: 'rating must be an integer between 1 and 5' });
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string') {
      errors.push({ field: 'comment', message: 'comment must be a string' });
    } else if (comment.length > 2000) {
      errors.push({ field: 'comment', message: 'comment cannot exceed 2000 characters' });
    }
  }

  return errors;
};

const validateUpdateReview = (req) => {
  const errors = validateIdParam(req);
  const { rating, comment } = req.body || {};

  if (rating === undefined && comment === undefined) {
    errors.push({ field: 'body', message: 'At least one of rating or comment is required for update' });
  }

  if (rating !== undefined) {
    const rate = parseInt(rating, 10);
    if (isNaN(rate) || rate < 1 || rate > 5) {
      errors.push({ field: 'rating', message: 'rating must be an integer between 1 and 5' });
    }
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string') {
      errors.push({ field: 'comment', message: 'comment must be a string' });
    } else if (comment.length > 2000) {
      errors.push({ field: 'comment', message: 'comment cannot exceed 2000 characters' });
    }
  }

  return errors;
};

module.exports = {
  validateIdParam,
  validateRecipeIdParam,
  validateCreateReview,
  validateUpdateReview,
};
