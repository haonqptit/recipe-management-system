const recipeService = require('./recipe.service');

class RecipeController {
  async listRecipes(req, res) {
    const { page, limit, categoryId, difficulty, sort } = req.query;
    const result = await recipeService.listRecipes({ page, limit, categoryId, difficulty, sort });
    res.status(200).json({
      success: true,
      message: 'Recipes retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getRecipeById(req, res) {
    const { id } = req.params;
    const recipe = await recipeService.getRecipeById(id);
    res.status(200).json({
      success: true,
      message: 'Recipe retrieved successfully',
      data: recipe,
    });
  }

  async createRecipe(req, res) {
    const userId = req.user.userId;
    const result = await recipeService.createRecipe(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: result,
    });
  }

  async updateRecipe(req, res) {
    const { id } = req.params;
    const result = await recipeService.updateRecipe(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: result,
    });
  }

  async deleteRecipe(req, res) {
    const { id } = req.params;
    const result = await recipeService.deleteRecipe(id);
    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
      data: result,
    });
  }

  async searchRecipes(req, res) {
    const { keyword, categoryId, difficulty, minPrepTime, maxPrepTime, page, limit } = req.query;
    const result = await recipeService.searchRecipes({
      keyword,
      categoryId,
      difficulty,
      minPrepTime,
      maxPrepTime,
      page,
      limit,
    });
    res.status(200).json({
      success: true,
      message: 'Recipes retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
}

module.exports = new RecipeController();
