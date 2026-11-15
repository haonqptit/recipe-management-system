const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

class IngredientService {
  async listIngredients({ page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, ingredients] = await Promise.all([
      prisma.ingredient.count(),
      prisma.ingredient.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          defaultUnit: true,
        },
      }),
    ]);

    return {
      data: ingredients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getIngredientById(id) {
    const ingredientId = parseInt(id, 10);
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: {
        id: true,
        name: true,
        description: true,
        defaultUnit: true,
      },
    });

    if (!ingredient) {
      throw ApiError.notFound('Ingredient not found');
    }

    return ingredient;
  }

  async createIngredient({ name, description, defaultUnit }) {
    const existing = await prisma.ingredient.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      throw ApiError.conflict('Ingredient name already exists', 'DUPLICATE_INGREDIENT_NAME');
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        defaultUnit: defaultUnit.trim(),
      },
    });

    return {
      id: ingredient.id,
      name: ingredient.name,
      defaultUnit: ingredient.defaultUnit,
    };
  }

  async updateIngredient(id, { name, description, defaultUnit }) {
    const ingredientId = parseInt(id, 10);
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw ApiError.notFound('Ingredient not found');
    }

    if (name && name.trim() !== ingredient.name) {
      const existing = await prisma.ingredient.findUnique({
        where: { name: name.trim() },
      });
      if (existing) {
        throw ApiError.conflict('Ingredient name already exists', 'DUPLICATE_INGREDIENT_NAME');
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (defaultUnit !== undefined) updateData.defaultUnit = defaultUnit.trim();

    const updated = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        defaultUnit: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      defaultUnit: updated.defaultUnit,
    };
  }

  async deleteIngredient(id) {
    const ingredientId = parseInt(id, 10);
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: {
        _count: {
          select: { recipeIngredients: true },
        },
      },
    });

    if (!ingredient) {
      throw ApiError.notFound('Ingredient not found');
    }

    if (ingredient._count.recipeIngredients > 0) {
      throw ApiError.conflict('Cannot delete ingredient used in recipes', 'INGREDIENT_IN_USE');
    }

    await prisma.ingredient.delete({
      where: { id: ingredientId },
    });

    return {
      id: ingredientId,
    };
  }

  async searchIngredients({ keyword, page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const term = keyword.trim();

    const where = {
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
      ],
    };

    const [total, ingredients] = await Promise.all([
      prisma.ingredient.count({ where }),
      prisma.ingredient.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          defaultUnit: true,
        },
      }),
    ]);

    return {
      data: ingredients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}

module.exports = new IngredientService();
