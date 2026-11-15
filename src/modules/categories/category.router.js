const express = require('express');
const categoryController = require('./category.controller');
const {
  validateIdParam,
  validateCreateCategory,
  validateUpdateCategory,
} = require('./category.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(categoryController.listCategories));
router.get('/:id/recipes', validate(validateIdParam), asyncHandler(categoryController.getRecipesByCategory));
router.get('/:id', validate(validateIdParam), asyncHandler(categoryController.getCategoryById));
router.post('/', authenticate, requireAdmin, validate(validateCreateCategory), asyncHandler(categoryController.createCategory));
router.put('/:id', authenticate, requireAdmin, validate(validateUpdateCategory), asyncHandler(categoryController.updateCategory));
router.delete('/:id', authenticate, requireAdmin, validate(validateIdParam), asyncHandler(categoryController.deleteCategory));

module.exports = router;
