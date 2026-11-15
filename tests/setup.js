const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

const resetTestDb = async () => {
  // Clean tables in reverse relation order
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.recipeStep.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create base admin and member accounts
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 10);
  const memberPasswordHash = await bcrypt.hash('StrongPassword123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.create({
    data: {
      username: 'foodlover',
      email: 'foodlover@example.com',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
    },
  });

  const category = await prisma.category.create({
    data: {
      name: 'Korean Food',
      description: 'Traditional and modern Korean dishes',
    },
  });

  const ingredient1 = await prisma.ingredient.create({
    data: {
      name: 'Rice',
      defaultUnit: 'gram',
      description: 'White rice',
    },
  });

  const ingredient2 = await prisma.ingredient.create({
    data: {
      name: 'Kimchi',
      defaultUnit: 'gram',
      description: 'Spicy fermented cabbage',
    },
  });

  const recipe = await prisma.recipe.create({
    data: {
      title: 'Kimchi Fried Rice',
      description: 'Korean fried rice with kimchi',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      difficulty: 'EASY',
      categoryId: category.id,
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredient1.id, quantity: 200, unit: 'gram', note: 'Cooked rice' },
          { ingredientId: ingredient2.id, quantity: 100, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Prepare ingredients' },
          { stepNumber: 2, instruction: 'Fry kimchi and rice together' },
        ],
      },
    },
  });

  return { admin, member, category, ingredient1, ingredient2, recipe };
};

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = {
  resetTestDb,
};
