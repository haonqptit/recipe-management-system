const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

class ReviewService {
  async getReviewsByRecipe(recipeId, { page = 1, limit = 10, sort = 'newest' }) {
    const rId = parseInt(recipeId, 10);

    const recipe = await prisma.recipe.findUnique({
      where: { id: rId },
    });
    if (!recipe) {
      throw ApiError.notFound('Recipe not found');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    let orderBy = { createdAt: 'desc' };
    if (sort === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    const [total, reviews, allRatings] = await Promise.all([
      prisma.review.count({ where: { recipeId: rId } }),
      prisma.review.findMany({
        where: { recipeId: rId },
        skip,
        take: limitNum,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      prisma.review.findMany({
        where: { recipeId: rId },
        select: { rating: true },
      }),
    ]);

    const reviewCount = allRatings.length;
    const averageRating = reviewCount > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

    const data = reviews.map((rev) => ({
      id: rev.id,
      rating: rev.rating,
      comment: rev.comment,
      user: rev.user,
      createdAt: rev.createdAt,
    }));

    return {
      data,
      summary: {
        averageRating,
        reviewCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getReviewById(id) {
    const reviewId = parseInt(id, 10);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    return {
      id: review.id,
      recipeId: review.recipeId,
      rating: review.rating,
      comment: review.comment,
      user: review.user,
    };
  }

  async createReview(userId, { recipeId, rating, comment }) {
    const rId = parseInt(recipeId, 10);

    const recipe = await prisma.recipe.findUnique({
      where: { id: rId },
    });
    if (!recipe) {
      throw ApiError.notFound('Recipe not found');
    }

    const existing = await prisma.review.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: rId,
        },
      },
    });
    if (existing) {
      throw ApiError.conflict('You have already reviewed this recipe', 'ALREADY_REVIEWED');
    }

    const review = await prisma.review.create({
      data: {
        userId,
        recipeId: rId,
        rating: parseInt(rating, 10),
        comment: comment ? comment.trim() : null,
      },
    });

    return {
      id: review.id,
      recipeId: review.recipeId,
      rating: review.rating,
      comment: review.comment,
    };
  }

  async updateReview(userId, id, { rating, comment }) {
    const reviewId = parseInt(id, 10);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      throw ApiError.notFound('Review not found');
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (comment !== undefined) updateData.comment = comment ? comment.trim() : null;

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return {
      id: updated.id,
      rating: updated.rating,
      comment: updated.comment,
    };
  }

  async deleteReview(user, id) {
    const reviewId = parseInt(id, 10);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (user.role !== 'ADMIN' && review.userId !== user.userId) {
      throw ApiError.forbidden('You are not authorized to delete this review');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return {
      id: reviewId,
    };
  }

  async getMyReviews(userId, { page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, reviews] = await Promise.all([
      prisma.review.count({
        where: { userId },
      }),
      prisma.review.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    const data = reviews.map((rev) => ({
      id: rev.id,
      recipe: rev.recipe,
      rating: rev.rating,
      comment: rev.comment,
      createdAt: rev.createdAt,
    }));

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}

module.exports = new ReviewService();
