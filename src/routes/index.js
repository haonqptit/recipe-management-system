const express = require('express');
const recipeRouter = require('../modules/recipes/recipe.router');
const categoryRouter = require('../modules/categories/category.router');
const ingredientRouter = require('../modules/ingredients/ingredient.router');
const favoriteRouter = require('../modules/favorites/favorite.router');
const reviewRouter = require('../modules/reviews/review.router');
const memberRouter = require('../modules/members/member.router');

const router = express.Router();

router.use('/recipes', recipeRouter);
router.use('/categories', categoryRouter);
router.use('/ingredients', ingredientRouter);
router.use('/favorites', favoriteRouter);
router.use('/reviews', reviewRouter);
router.use('/members', memberRouter);

module.exports = router;
