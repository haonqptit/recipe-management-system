const express = require('express');
const ingredientController = require('./ingredient.controller');
const {
  validateIdParam,
  validateCreateIngredient,
  validateUpdateIngredient,
  validateSearchIngredient,
} = require('./ingredient.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(ingredientController.listIngredients));
router.get('/search', validate(validateSearchIngredient), asyncHandler(ingredientController.searchIngredients));
router.get('/:id', validate(validateIdParam), asyncHandler(ingredientController.getIngredientById));
router.post('/', authenticate, requireAdmin, validate(validateCreateIngredient), asyncHandler(ingredientController.createIngredient));
router.put('/:id', authenticate, requireAdmin, validate(validateUpdateIngredient), asyncHandler(ingredientController.updateIngredient));
router.delete('/:id', authenticate, requireAdmin, validate(validateIdParam), asyncHandler(ingredientController.deleteIngredient));

module.exports = router;
