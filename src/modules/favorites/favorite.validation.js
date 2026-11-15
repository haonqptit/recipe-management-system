const validateIdParam = (req) => {
  const errors = [];
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    errors.push({ field: 'id', message: 'Favorite ID must be a positive integer' });
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

const validateAddFavorite = (req) => {
  const errors = [];
  const { recipeId } = req.body || {};

  const id = parseInt(recipeId, 10);
  if (isNaN(id) || id <= 0) {
    errors.push({ field: 'recipeId', message: 'recipeId must be a positive integer' });
  }

  return errors;
};

module.exports = {
  validateIdParam,
  validateRecipeIdParam,
  validateAddFavorite,
};
