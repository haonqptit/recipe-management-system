const validateIdParam = (req) => {
  const errors = [];
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    errors.push({ field: 'id', message: 'Category ID must be a positive integer' });
  }
  return errors;
};

const validateCreateCategory = (req) => {
  const errors = [];
  const { name, description, imageUrl } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'name is required' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'name cannot exceed 100 characters' });
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.length > 500) {
      errors.push({ field: 'imageUrl', message: 'imageUrl must be a string up to 500 characters' });
    }
  }

  return errors;
};

const validateUpdateCategory = (req) => {
  const errors = validateIdParam(req);
  const { name, description, imageUrl } = req.body || {};

  if (name === undefined && description === undefined && imageUrl === undefined) {
    errors.push({ field: 'body', message: 'At least one field (name, description, imageUrl) is required for update' });
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'name cannot be empty' });
    } else if (name.length > 100) {
      errors.push({ field: 'name', message: 'name cannot exceed 100 characters' });
    }
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.length > 500) {
      errors.push({ field: 'imageUrl', message: 'imageUrl must be a string up to 500 characters' });
    }
  }

  return errors;
};

module.exports = {
  validateIdParam,
  validateCreateCategory,
  validateUpdateCategory,
};
