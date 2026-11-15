const express = require('express');
const recipeController = require('./recipe.controller');
const {
  validateIdParam,
  validateCreateRecipe,
  validateUpdateRecipe,
} = require('./recipe.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(recipeController.listRecipes));
router.get('/search', asyncHandler(recipeController.searchRecipes));
router.get('/:id', validate(validateIdParam), asyncHandler(recipeController.getRecipeById));
router.post('/', authenticate, requireAdmin, validate(validateCreateRecipe), asyncHandler(recipeController.createRecipe));
router.put('/:id', authenticate, requireAdmin, validate(validateUpdateRecipe), asyncHandler(recipeController.updateRecipe));
router.delete('/:id', authenticate, requireAdmin, validate(validateIdParam), asyncHandler(recipeController.deleteRecipe));

module.exports = router;
