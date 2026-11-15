const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data in reverse order of dependencies
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.recipeStep.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
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

  console.log('Seeded users: admin, foodlover');

  // 3. Seed Categories
  const categoriesData = [
    { name: 'Korean Food', description: 'Traditional and modern Korean dishes', imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600' },
    { name: 'Chinese Food', description: 'Delicious Chinese cuisine', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
    { name: 'Japanese Food', description: 'Fresh and savory Japanese cuisine', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600' },
    { name: 'Western Food', description: 'Classic Western recipes', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?w=600' },
    { name: 'Dessert', description: 'Sweet treats and desserts', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.name] = created.id;
  }
  console.log('Seeded categories: 5 categories created');

  // 4. Seed Ingredients
  const ingredientsData = [
    { name: 'Rice', defaultUnit: 'gram', description: 'White rice' },
    { name: 'Kimchi', defaultUnit: 'gram', description: 'Fermented spicy napa cabbage' },
    { name: 'Egg', defaultUnit: 'piece', description: 'Fresh chicken egg' },
    { name: 'Onion', defaultUnit: 'gram', description: 'Yellow onion' },
    { name: 'Garlic', defaultUnit: 'gram', description: 'Fresh garlic cloves' },
    { name: 'Tomato', defaultUnit: 'gram', description: 'Fresh ripe red tomatoes' },
    { name: 'Pasta', defaultUnit: 'gram', description: 'Dried spaghetti pasta' },
    { name: 'Milk', defaultUnit: 'ml', description: 'Whole cow milk' },
    { name: 'Sugar', defaultUnit: 'gram', description: 'Granulated white sugar' },
    { name: 'Salt', defaultUnit: 'gram', description: 'Fine table salt' },
  ];

  const ingredientMap = {};
  for (const ing of ingredientsData) {
    const created = await prisma.ingredient.create({ data: ing });
    ingredientMap[ing.name] = created.id;
  }
  console.log('Seeded ingredients: 10 ingredients created');

  // 5. Seed Recipes with RecipeIngredient and RecipeStep in transaction
  const kimchiFriedRice = await prisma.recipe.create({
    data: {
      title: 'Kimchi Fried Rice',
      description: 'Korean fried rice with kimchi',
      imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      difficulty: 'EASY',
      categoryId: categoryMap['Korean Food'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Rice'], quantity: 200, unit: 'gram', note: 'Cooked rice' },
          { ingredientId: ingredientMap['Kimchi'], quantity: 100, unit: 'gram', note: 'Chopped kimchi' },
          { ingredientId: ingredientMap['Egg'], quantity: 1, unit: 'piece', note: 'Fried egg for topping' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Prepare all ingredients', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
          { stepNumber: 2, instruction: 'Fry kimchi and rice together', imageUrl: null },
        ],
      },
    },
  });

  const bibimbap = await prisma.recipe.create({
    data: {
      title: 'Bibimbap',
      description: 'Korean mixed rice with vegetables and egg',
      imageUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600',
      prepTime: 20,
      cookTime: 15,
      servings: 2,
      difficulty: 'MEDIUM',
      categoryId: categoryMap['Korean Food'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Rice'], quantity: 200, unit: 'gram' },
          { ingredientId: ingredientMap['Egg'], quantity: 1, unit: 'piece' },
          { ingredientId: ingredientMap['Garlic'], quantity: 10, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Cook rice and prepare vegetables' },
          { stepNumber: 2, instruction: 'Assemble bowl and top with fried egg' },
        ],
      },
    },
  });

  const bulgogi = await prisma.recipe.create({
    data: {
      title: 'Bulgogi',
      description: 'Marinated grilled Korean beef',
      imageUrl: 'https://images.unsplash.com/photo-1583032015879-c5c2d3663a02?w=600',
      prepTime: 30,
      cookTime: 15,
      servings: 3,
      difficulty: 'MEDIUM',
      categoryId: categoryMap['Korean Food'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Onion'], quantity: 50, unit: 'gram' },
          { ingredientId: ingredientMap['Garlic'], quantity: 20, unit: 'gram' },
          { ingredientId: ingredientMap['Sugar'], quantity: 15, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Marinate the beef with sliced onions and garlic' },
          { stepNumber: 2, instruction: 'Stir fry on high heat until cooked' },
        ],
      },
    },
  });

  const mapoTofu = await prisma.recipe.create({
    data: {
      title: 'Mapo Tofu',
      description: 'Spicy and flavorful Chinese tofu dish',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      difficulty: 'MEDIUM',
      categoryId: categoryMap['Chinese Food'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Garlic'], quantity: 15, unit: 'gram' },
          { ingredientId: ingredientMap['Onion'], quantity: 30, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Sauté aromatics in a hot wok' },
          { stepNumber: 2, instruction: 'Simmer tofu in chili bean sauce' },
        ],
      },
    },
  });

  const sushi = await prisma.recipe.create({
    data: {
      title: 'Sushi',
      description: 'Traditional Japanese sushi rolls',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600',
      prepTime: 30,
      cookTime: 20,
      servings: 2,
      difficulty: 'HARD',
      categoryId: categoryMap['Japanese Food'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Rice'], quantity: 300, unit: 'gram' },
          { ingredientId: ingredientMap['Salt'], quantity: 5, unit: 'gram' },
          { ingredientId: ingredientMap['Sugar'], quantity: 10, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Season cooked rice with vinegar and sugar' },
          { stepNumber: 2, instruction: 'Roll tightly with fillings and slice' },
        ],
      },
    },
  });

  const pasta = await prisma.recipe.create({
    data: {
      title: 'Pasta',
      description: 'Classic tomato garlic pasta',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?w=600',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      difficulty: 'EASY',
      categoryId: categoryMap['Western Food'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Pasta'], quantity: 200, unit: 'gram' },
          { ingredientId: ingredientMap['Tomato'], quantity: 150, unit: 'gram' },
          { ingredientId: ingredientMap['Garlic'], quantity: 15, unit: 'gram' },
          { ingredientId: ingredientMap['Salt'], quantity: 5, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Boil pasta in salted water until al dente' },
          { stepNumber: 2, instruction: 'Toss pasta in simmered tomato garlic sauce' },
        ],
      },
    },
  });

  const pancake = await prisma.recipe.create({
    data: {
      title: 'Pancake',
      description: 'Fluffy homemade sweet pancakes',
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
      prepTime: 10,
      cookTime: 10,
      servings: 4,
      difficulty: 'EASY',
      categoryId: categoryMap['Dessert'],
      createdById: admin.id,
      ingredients: {
        create: [
          { ingredientId: ingredientMap['Milk'], quantity: 200, unit: 'ml' },
          { ingredientId: ingredientMap['Egg'], quantity: 2, unit: 'piece' },
          { ingredientId: ingredientMap['Sugar'], quantity: 30, unit: 'gram' },
          { ingredientId: ingredientMap['Salt'], quantity: 2, unit: 'gram' },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: 'Whisk milk, eggs, and sugar into batter' },
          { stepNumber: 2, instruction: 'Cook on a lightly buttered pan until golden on both sides' },
        ],
      },
    },
  });

  console.log('Seeded 7 recipes with images');

  // 6. Seed Favorites and Reviews
  await prisma.favorite.create({
    data: {
      userId: member.id,
      recipeId: kimchiFriedRice.id,
    },
  });
  console.log('Seeded favorite for foodlover on Kimchi Fried Rice');

  await prisma.review.create({
    data: {
      userId: member.id,
      recipeId: kimchiFriedRice.id,
      rating: 5,
      comment: 'Very delicious',
    },
  });
  console.log('Seeded review for foodlover on Kimchi Fried Rice');

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
