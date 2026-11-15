const express = require('express');
const reviewController = require('./review.controller');
const {
  validateIdParam,
  validateRecipeIdParam,
  validateCreateReview,
  validateUpdateReview,
} = require('./review.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/recipe/:recipeId', validate(validateRecipeIdParam), asyncHandler(reviewController.getReviewsByRecipe));
router.get('/my-reviews', authenticate, asyncHandler(reviewController.getMyReviews));
router.get('/:id', validate(validateIdParam), asyncHandler(reviewController.getReviewById));
router.post('/', authenticate, validate(validateCreateReview), asyncHandler(reviewController.createReview));
router.put('/:id', authenticate, validate(validateUpdateReview), asyncHandler(reviewController.updateReview));
router.delete('/:id', authenticate, validate(validateIdParam), asyncHandler(reviewController.deleteReview));

module.exports = router;
