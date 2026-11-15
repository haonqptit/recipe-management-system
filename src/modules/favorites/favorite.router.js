const express = require('express');
const favoriteController = require('./favorite.controller');
const {
  validateIdParam,
  validateRecipeIdParam,
  validateAddFavorite,
} = require('./favorite.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/', authenticate, asyncHandler(favoriteController.listMyFavorites));
router.post('/', authenticate, validate(validateAddFavorite), asyncHandler(favoriteController.addFavorite));
router.get('/recipe/:recipeId', authenticate, validate(validateRecipeIdParam), asyncHandler(favoriteController.checkFavoriteStatus));
router.delete('/recipe/:recipeId', authenticate, validate(validateRecipeIdParam), asyncHandler(favoriteController.removeFavoriteByRecipeId));
router.get('/:id', authenticate, validate(validateIdParam), asyncHandler(favoriteController.getMyFavoriteById));
router.delete('/:id', authenticate, validate(validateIdParam), asyncHandler(favoriteController.removeFavoriteById));

module.exports = router;
