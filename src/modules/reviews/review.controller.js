const reviewService = require('./review.service');

class ReviewController {
  async getReviewsByRecipe(req, res) {
    const { recipeId } = req.params;
    const { page, limit, sort } = req.query;
    const result = await reviewService.getReviewsByRecipe(recipeId, { page, limit, sort });
    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.data,
      summary: result.summary,
      pagination: result.pagination,
    });
  }

  async getReviewById(req, res) {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);
    res.status(200).json({
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    });
  }

  async createReview(req, res) {
    const userId = req.user.userId;
    const { recipeId, rating, comment } = req.body;
    const result = await reviewService.createReview(userId, { recipeId, rating, comment });
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result,
    });
  }

  async updateReview(req, res) {
    const userId = req.user.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;
    const result = await reviewService.updateReview(userId, id, { rating, comment });
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: result,
    });
  }

  async deleteReview(req, res) {
    const user = req.user;
    const { id } = req.params;
    const result = await reviewService.deleteReview(user, id);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: result,
    });
  }

  async getMyReviews(req, res) {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    const result = await reviewService.getMyReviews(userId, { page, limit });
    res.status(200).json({
      success: true,
      message: 'My reviews retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
}

module.exports = new ReviewController();
