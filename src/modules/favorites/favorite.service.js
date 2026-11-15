const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

class FavoriteService {
  async listMyFavorites(userId, { page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, favorites] = await Promise.all([
      prisma.favorite.count({
        where: { userId },
      }),
      prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              difficulty: true,
            },
          },
        },
      }),
    ]);

    const data = favorites.map((fav) => ({
      id: fav.id,
      recipe: fav.recipe,
      createdAt: fav.createdAt,
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

  async getMyFavoriteById(userId, id) {
    const favoriteId = parseInt(id, 10);
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
      include: {
        recipe: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!favorite || favorite.userId !== userId) {
      throw ApiError.notFound('Favorite not found');
    }

    return {
      id: favorite.id,
      recipeId: favorite.recipeId,
      recipeTitle: favorite.recipe.title,
    };
  }

  async addFavorite(userId, recipeId) {
    const rId = parseInt(recipeId, 10);

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: rId },
    });
    if (!recipe) {
      throw ApiError.notFound('Recipe not found');
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: rId,
        },
      },
    });
    if (existing) {
      throw ApiError.conflict('Recipe is already in favorites', 'ALREADY_FAVORITED');
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        recipeId: rId,
      },
    });

    return {
      id: favorite.id,
      recipeId: favorite.recipeId,
    };
  }

  async removeFavoriteById(userId, id) {
    const favoriteId = parseInt(id, 10);
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite || favorite.userId !== userId) {
      throw ApiError.notFound('Favorite not found');
    }

    await prisma.favorite.delete({
      where: { id: favoriteId },
    });

    return {
      id: favoriteId,
    };
  }

  async checkFavoriteStatus(userId, recipeId) {
    const rId = parseInt(recipeId, 10);

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: rId,
        },
      },
    });

    return {
      recipeId: rId,
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null,
    };
  }

  async removeFavoriteByRecipeId(userId, recipeId) {
    const rId = parseInt(recipeId, 10);

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: rId,
        },
      },
    });

    if (!favorite) {
      throw ApiError.notFound('Recipe is not in favorites');
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return {
      recipeId: rId,
    };
  }
}

module.exports = new FavoriteService();
