const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

class RecipeService {
  async listRecipes({ page = 1, limit = 10, categoryId, difficulty, sort = 'newest' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const orderBy = { createdAt: sort === 'oldest' ? 'asc' : 'desc' };

    const where = {};
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [total, recipes] = await Promise.all([
      prisma.recipe.count({ where }),
      prisma.recipe.findMany({
        where,
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

  async getRecipeById(id) {
    const recipeId = parseInt(id, 10);
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        category: {
          select: { id: true, name: true },
        },
        ingredients: {
          include: {
            ingredient: {
              select: { name: true },
            },
          },
        },
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!recipe) {
      throw ApiError.notFound('Recipe not found');
    }

    const reviewCount = recipe.reviews.length;
    const averageRating = reviewCount > 0
      ? Math.round((recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

    const formattedIngredients = recipe.ingredients.map((item) => ({
      ingredientId: item.ingredientId,
      name: item.ingredient?.name || '',
      quantity: Number(item.quantity),
      unit: item.unit,
      note: item.note,
    }));

    const formattedSteps = recipe.steps.map((step) => ({
      stepNumber: step.stepNumber,
      instruction: step.instruction,
      imageUrl: step.imageUrl,
    }));

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
      ingredients: formattedIngredients,
      steps: formattedSteps,
      averageRating,
      reviewCount,
    };
  }

  async createRecipe(userId, recipeData) {
    const {
      title,
      description,
      categoryId,
      imageUrl,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      steps,
    } = recipeData;

    return await prisma.$transaction(async (tx) => {
      // Check category exists
      const category = await tx.category.findUnique({
        where: { id: parseInt(categoryId, 10) },
      });
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      // Check all ingredients exist
      const ingredientIds = ingredients.map((ing) => parseInt(ing.ingredientId, 10));
      const foundIngredients = await tx.ingredient.findMany({
        where: { id: { in: ingredientIds } },
      });
      if (foundIngredients.length !== ingredientIds.length) {
        throw ApiError.notFound('One or more ingredients do not exist');
      }

      // Create Recipe with ingredients and steps
      const recipe = await tx.recipe.create({
        data: {
          title: title.trim(),
          description: description ? description.trim() : null,
          categoryId: parseInt(categoryId, 10),
          createdById: userId,
          imageUrl: imageUrl ? imageUrl.trim() : null,
          prepTime: parseInt(prepTime, 10),
          cookTime: parseInt(cookTime, 10),
          servings: parseInt(servings, 10),
          difficulty,
          ingredients: {
            create: ingredients.map((ing) => ({
              ingredientId: parseInt(ing.ingredientId, 10),
              quantity: parseFloat(ing.quantity),
              unit: ing.unit.trim(),
              note: ing.note ? ing.note.trim() : null,
            })),
          },
          steps: {
            create: steps.map((s) => ({
              stepNumber: parseInt(s.stepNumber, 10),
              instruction: s.instruction.trim(),
              imageUrl: s.imageUrl ? s.imageUrl.trim() : null,
            })),
          },
        },
      });

      return {
        id: recipe.id,
        title: recipe.title,
      };
    });
  }

  async updateRecipe(id, recipeData) {
    const recipeId = parseInt(id, 10);
    const {
      title,
      description,
      categoryId,
      imageUrl,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      steps,
    } = recipeData;

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.recipe.findUnique({
        where: { id: recipeId },
      });
      if (!existing) {
        throw ApiError.notFound('Recipe not found');
      }

      if (categoryId !== undefined) {
        const category = await tx.category.findUnique({
          where: { id: parseInt(categoryId, 10) },
        });
        if (!category) {
          throw ApiError.notFound('Category not found');
        }
      }

      // If ingredients provided, validate and replace
      if (ingredients !== undefined) {
        const ingredientIds = ingredients.map((ing) => parseInt(ing.ingredientId, 10));
        const foundIngredients = await tx.ingredient.findMany({
          where: { id: { in: ingredientIds } },
        });
        if (foundIngredients.length !== ingredientIds.length) {
          throw ApiError.notFound('One or more ingredients do not exist');
        }

        await tx.recipeIngredient.deleteMany({
          where: { recipeId },
        });

        for (const ing of ingredients) {
          await tx.recipeIngredient.create({
            data: {
              recipeId,
              ingredientId: parseInt(ing.ingredientId, 10),
              quantity: parseFloat(ing.quantity),
              unit: ing.unit.trim(),
              note: ing.note ? ing.note.trim() : null,
            },
          });
        }
      }

      // If steps provided, replace
      if (steps !== undefined) {
        await tx.recipeStep.deleteMany({
          where: { recipeId },
        });

        for (const s of steps) {
          await tx.recipeStep.create({
            data: {
              recipeId,
              stepNumber: parseInt(s.stepNumber, 10),
              instruction: s.instruction.trim(),
              imageUrl: s.imageUrl ? s.imageUrl.trim() : null,
            },
          });
        }
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description ? description.trim() : null;
      if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId, 10);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? imageUrl.trim() : null;
      if (prepTime !== undefined) updateData.prepTime = parseInt(prepTime, 10);
      if (cookTime !== undefined) updateData.cookTime = parseInt(cookTime, 10);
      if (servings !== undefined) updateData.servings = parseInt(servings, 10);
      if (difficulty !== undefined) updateData.difficulty = difficulty;

      const updated = await tx.recipe.update({
        where: { id: recipeId },
        data: updateData,
      });

      return {
        id: updated.id,
        title: updated.title,
      };
    });
  }

  async deleteRecipe(id) {
    const recipeId = parseInt(id, 10);

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.recipe.findUnique({
        where: { id: recipeId },
      });
      if (!existing) {
        throw ApiError.notFound('Recipe not found');
      }

      await tx.recipe.delete({
        where: { id: recipeId },
      });

      return {
        id: recipeId,
      };
    });
  }

  async searchRecipes({ keyword, categoryId, difficulty, minPrepTime, maxPrepTime, page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (keyword && keyword.trim().length > 0) {
      const term = keyword.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (minPrepTime !== undefined || maxPrepTime !== undefined) {
      where.prepTime = {};
      if (minPrepTime !== undefined) where.prepTime.gte = parseInt(minPrepTime, 10);
      if (maxPrepTime !== undefined) where.prepTime.lte = parseInt(maxPrepTime, 10);
    }

    const [total, recipes] = await Promise.all([
      prisma.recipe.count({ where }),
      prisma.recipe.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
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

module.exports = new RecipeService();
