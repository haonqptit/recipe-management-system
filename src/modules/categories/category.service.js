const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

class CategoryService {
  async listCategories({ page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, categories] = await Promise.all([
      prisma.category.count(),
      prisma.category.findMany({
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { recipes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const data = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
      recipeCount: cat._count.recipes,
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

  async getCategoryById(id) {
    const categoryId = parseInt(id, 10);
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      recipeCount: category._count.recipes,
    };
  }

  async createCategory({ name, description, imageUrl }) {
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      throw ApiError.conflict('Category name already exists', 'DUPLICATE_CATEGORY_NAME');
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
      },
    });

    return {
      id: category.id,
      name: category.name,
    };
  }

  async updateCategory(id, { name, description, imageUrl }) {
    const categoryId = parseInt(id, 10);
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (name && name.trim() !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name: name.trim() },
      });
      if (existing) {
        throw ApiError.conflict('Category name already exists', 'DUPLICATE_CATEGORY_NAME');
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? imageUrl.trim() : null;

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return {
      id: updated.id,
      name: updated.name,
    };
  }

  async deleteCategory(id) {
    const categoryId = parseInt(id, 10);
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (category._count.recipes > 0) {
      throw ApiError.conflict('Cannot delete category with associated recipes', 'CATEGORY_IN_USE');
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return {
      id: categoryId,
    };
  }

  async getRecipesByCategory(id, { page = 1, limit = 10, sort = 'newest' }) {
    const categoryId = parseInt(id, 10);
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const orderBy = { createdAt: sort === 'oldest' ? 'asc' : 'desc' };

    const [total, recipes] = await Promise.all([
      prisma.recipe.count({
        where: { categoryId },
      }),
      prisma.recipe.findMany({
        where: { categoryId },
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
    ]);

    const data = recipes.map((recipe) => {
      const reviewCount = recipe.reviews.length;
      const averageRating = reviewCount > 0
        ? Math.round((recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0;

      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        imageUrl: recipe.imageUrl,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        category: recipe.category,
        averageRating,
        reviewCount,
      };
    });

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

module.exports = new CategoryService();
