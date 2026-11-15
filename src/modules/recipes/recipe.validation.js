const validateIdParam = (req) => {
  const errors = [];
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    errors.push({ field: 'id', message: 'Recipe ID must be a positive integer' });
  }
  return errors;
};

const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];

const validateCreateRecipe = (req) => {
  const errors = [];
  const {
    title,
    description,
    categoryId,
    imageUrl,
    prepTime,
    cookTime,
    servings,
    difficulty,
    ingredients,
    steps,
  } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'title is required' });
  } else if (title.length > 200) {
    errors.push({ field: 'title', message: 'title cannot exceed 200 characters' });
  }

  const catId = parseInt(categoryId, 10);
  if (isNaN(catId) || catId <= 0) {
    errors.push({ field: 'categoryId', message: 'categoryId must be a positive integer' });
  }

  const prep = parseInt(prepTime, 10);
  if (isNaN(prep) || prep < 0) {
    errors.push({ field: 'prepTime', message: 'prepTime must be an integer >= 0' });
  }

  const cook = parseInt(cookTime, 10);
  if (isNaN(cook) || cook < 0) {
    errors.push({ field: 'cookTime', message: 'cookTime must be an integer >= 0' });
  }

  const serv = parseInt(servings, 10);
  if (isNaN(serv) || serv <= 0) {
    errors.push({ field: 'servings', message: 'servings must be an integer > 0' });
  }

  if (!difficulty || !validDifficulties.includes(difficulty)) {
    errors.push({ field: 'difficulty', message: `difficulty must be one of: ${validDifficulties.join(', ')}` });
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.length > 500) {
      errors.push({ field: 'imageUrl', message: 'imageUrl must be a string up to 500 characters' });
    }
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    errors.push({ field: 'ingredients', message: 'ingredients must be a non-empty array' });
  } else {
    ingredients.forEach((ing, index) => {
      const ingId = parseInt(ing.ingredientId, 10);
      if (isNaN(ingId) || ingId <= 0) {
        errors.push({ field: `ingredients[${index}].ingredientId`, message: 'ingredientId must be a positive integer' });
      }
      const qty = parseFloat(ing.quantity);
      if (isNaN(qty) || qty <= 0) {
        errors.push({ field: `ingredients[${index}].quantity`, message: 'quantity must be a number > 0' });
      }
      if (!ing.unit || typeof ing.unit !== 'string' || ing.unit.trim().length === 0) {
        errors.push({ field: `ingredients[${index}].unit`, message: 'unit is required' });
      }
    });
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    errors.push({ field: 'steps', message: 'steps must be a non-empty array' });
  } else {
    steps.forEach((step, index) => {
      const stepNum = parseInt(step.stepNumber, 10);
      if (isNaN(stepNum) || stepNum <= 0) {
        errors.push({ field: `steps[${index}].stepNumber`, message: 'stepNumber must be a positive integer' });
      }
      if (!step.instruction || typeof step.instruction !== 'string' || step.instruction.trim().length === 0) {
        errors.push({ field: `steps[${index}].instruction`, message: 'instruction is required' });
      }
    });
  }

  return errors;
};

const validateUpdateRecipe = (req) => {
  const errors = validateIdParam(req);
  const {
    title,
    description,
    categoryId,
    imageUrl,
    prepTime,
    cookTime,
    servings,
    difficulty,
    ingredients,
    steps,
  } = req.body || {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', message: 'title cannot be empty' });
    } else if (title.length > 200) {
      errors.push({ field: 'title', message: 'title cannot exceed 200 characters' });
    }
  }

  if (categoryId !== undefined) {
    const catId = parseInt(categoryId, 10);
    if (isNaN(catId) || catId <= 0) {
      errors.push({ field: 'categoryId', message: 'categoryId must be a positive integer' });
    }
  }

  if (prepTime !== undefined) {
    const prep = parseInt(prepTime, 10);
    if (isNaN(prep) || prep < 0) {
      errors.push({ field: 'prepTime', message: 'prepTime must be an integer >= 0' });
    }
  }

  if (cookTime !== undefined) {
    const cook = parseInt(cookTime, 10);
    if (isNaN(cook) || cook < 0) {
      errors.push({ field: 'cookTime', message: 'cookTime must be an integer >= 0' });
    }
  }

  if (servings !== undefined) {
    const serv = parseInt(servings, 10);
    if (isNaN(serv) || serv <= 0) {
      errors.push({ field: 'servings', message: 'servings must be an integer > 0' });
    }
  }

  if (difficulty !== undefined && !validDifficulties.includes(difficulty)) {
    errors.push({ field: 'difficulty', message: `difficulty must be one of: ${validDifficulties.join(', ')}` });
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.length > 500) {
      errors.push({ field: 'imageUrl', message: 'imageUrl must be a string up to 500 characters' });
    }
  }

  if (ingredients !== undefined) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      errors.push({ field: 'ingredients', message: 'ingredients must be a non-empty array when provided' });
    } else {
      ingredients.forEach((ing, index) => {
        const ingId = parseInt(ing.ingredientId, 10);
        if (isNaN(ingId) || ingId <= 0) {
          errors.push({ field: `ingredients[${index}].ingredientId`, message: 'ingredientId must be a positive integer' });
        }
        const qty = parseFloat(ing.quantity);
        if (isNaN(qty) || qty <= 0) {
          errors.push({ field: `ingredients[${index}].quantity`, message: 'quantity must be a number > 0' });
        }
        if (!ing.unit || typeof ing.unit !== 'string' || ing.unit.trim().length === 0) {
          errors.push({ field: `ingredients[${index}].unit`, message: 'unit is required' });
        }
      });
    }
  }

  if (steps !== undefined) {
    if (!Array.isArray(steps) || steps.length === 0) {
      errors.push({ field: 'steps', message: 'steps must be a non-empty array when provided' });
    } else {
      steps.forEach((step, index) => {
        const stepNum = parseInt(step.stepNumber, 10);
        if (isNaN(stepNum) || stepNum <= 0) {
          errors.push({ field: `steps[${index}].stepNumber`, message: 'stepNumber must be a positive integer' });
        }
        if (!step.instruction || typeof step.instruction !== 'string' || step.instruction.trim().length === 0) {
          errors.push({ field: `steps[${index}].instruction`, message: 'instruction is required' });
        }
      });
    }
  }

  return errors;
};

module.exports = {
  validateIdParam,
  validateCreateRecipe,
  validateUpdateRecipe,
};
