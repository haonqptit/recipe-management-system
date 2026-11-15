const favoriteService = require('./favorite.service');

class FavoriteController {
  async listMyFavorites(req, res) {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    const result = await favoriteService.listMyFavorites(userId, { page, limit });
    res.status(200).json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getMyFavoriteById(req, res) {
    const userId = req.user.userId;
    const { id } = req.params;
    const result = await favoriteService.getMyFavoriteById(userId, id);
    res.status(200).json({
      success: true,
      message: 'Favorite retrieved successfully',
      data: result,
    });
  }

  async addFavorite(req, res) {
    const userId = req.user.userId;
    const { recipeId } = req.body;
    const result = await favoriteService.addFavorite(userId, recipeId);
    res.status(201).json({
      success: true,
      message: 'Recipe added to favorites',
      data: result,
    });
  }

  async removeFavoriteById(req, res) {
    const userId = req.user.userId;
    const { id } = req.params;
    const result = await favoriteService.removeFavoriteById(userId, id);
    res.status(200).json({
      success: true,
      message: 'Favorite removed successfully',
      data: result,
    });
  }

  async checkFavoriteStatus(req, res) {
    const userId = req.user.userId;
    const { recipeId } = req.params;
    const result = await favoriteService.checkFavoriteStatus(userId, recipeId);
    res.status(200).json({
      success: true,
      message: 'Favorite status retrieved successfully',
      data: result,
    });
  }

  async removeFavoriteByRecipeId(req, res) {
    const userId = req.user.userId;
    const { recipeId } = req.params;
    const result = await favoriteService.removeFavoriteByRecipeId(userId, recipeId);
    res.status(200).json({
      success: true,
      message: 'Recipe removed from favorites',
      data: result,
    });
  }
}

module.exports = new FavoriteController();
