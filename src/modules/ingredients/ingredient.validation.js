const validateIdParam = (req) => {
  const errors = [];
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    errors.push({ field: 'id', message: 'Ingredient ID must be a positive integer' });
  }
  return errors;
};

const validateCreateIngredient = (req) => {
  const errors = [];
  const { name, description, defaultUnit } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'name is required' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'name cannot exceed 100 characters' });
  }

  if (!defaultUnit || typeof defaultUnit !== 'string' || defaultUnit.trim().length === 0) {
    errors.push({ field: 'defaultUnit', message: 'defaultUnit is required' });
  } else if (defaultUnit.length > 30) {
    errors.push({ field: 'defaultUnit', message: 'defaultUnit cannot exceed 30 characters' });
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  return errors;
};

const validateUpdateIngredient = (req) => {
  const errors = validateIdParam(req);
  const { name, description, defaultUnit } = req.body || {};

  if (name === undefined && description === undefined && defaultUnit === undefined) {
    errors.push({ field: 'body', message: 'At least one field (name, description, defaultUnit) is required for update' });
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'name cannot be empty' });
    } else if (name.length > 100) {
      errors.push({ field: 'name', message: 'name cannot exceed 100 characters' });
    }
  }

  if (defaultUnit !== undefined) {
    if (typeof defaultUnit !== 'string' || defaultUnit.trim().length === 0) {
      errors.push({ field: 'defaultUnit', message: 'defaultUnit cannot be empty' });
    } else if (defaultUnit.length > 30) {
      errors.push({ field: 'defaultUnit', message: 'defaultUnit cannot exceed 30 characters' });
    }
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  return errors;
};

const validateSearchIngredient = (req) => {
  const errors = [];
  const { keyword } = req.query || {};

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    errors.push({ field: 'keyword', message: 'keyword query parameter is required' });
  }

  return errors;
};

module.exports = {
  validateIdParam,
  validateCreateIngredient,
  validateUpdateIngredient,
  validateSearchIngredient,
};
