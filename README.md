# Cooking Recipe Management System (요리 레시피 관리 시스템)

A production-ready RESTful API backend and web application built with **Node.js**, **Express.js**, **MySQL**, **Prisma ORM**, **JWT**, **Jest**, and **Supertest** following clean architecture with strict separation of **Router**, **Controller**, **Service**, and **Validation**.

---

## 1. Project Overview

The Cooking Recipe Management System provides an end-to-end platform for exploring recipes, categorizing culinary dishes, managing ingredients, tracking personal favorites, and submitting community reviews and ratings.

### Key Highlights
- **5 Independent Business Routers**: Recipes, Categories, Ingredients, Favorites, Reviews.
- **6 Working Endpoints per Business Router** (30 business APIs total).
- **Separated Member Router** with 6 endpoints for authentication and user profiles (does not count toward business router quota).
- **Real MySQL Database & Prisma ORM** with comprehensive schema integrity, cascading rules, foreign keys, and unique constraints.
- **Layered Architecture**: Router ➔ Controller ➔ Service ➔ Validation ➔ Prisma ORM.
- **Robust Security**: Role-based access control (`GUEST`, `MEMBER`, `ADMIN`), bcrypt password hashing, stateless JWT authentication.
- **Full Test Coverage**: 51 automated unit and integration tests with Jest and Supertest verifying success and failure scenarios for core endpoints.
- **Interactive OpenAPI 3.0 / Swagger UI** at `/api-docs`.
- **Integrated Web Frontend** in `public/` using HTML5, CSS3, JavaScript, and Bootstrap 5.

---

## 2. Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime & Framework** | Node.js (v20+), Express.js (v5) |
| **Database** | MySQL 8.0 |
| **ORM** | Prisma ORM (v6) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Testing** | Jest, Supertest |
| **API Docs** | OpenAPI 3.0, Swagger UI Express, YAMLjs |
| **Frontend UI** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons |

---

## 3. System Architecture & Directory Structure

```text
recipe-management-system/
├── prisma/
│   ├── schema.prisma              # Prisma database schema (8 models)
│   ├── migrations/                # Database migration history
│   └── seed.js                    # Database seed script
├── src/
│   ├── app.js                     # Express app setup and middleware configuration
│   ├── server.js                  # HTTP server bootstrap
│   ├── config/
│   │   └── env.js                 # Environment variable management
│   ├── lib/
│   │   └── prisma.js              # Prisma Client instance
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT Bearer token authentication
│   │   ├── admin.middleware.js    # ADMIN role authorization
│   │   ├── validate.middleware.js # Request validator middleware
│   │   ├── not-found.middleware.js# 404 handler
│   │   └── error.middleware.js    # Global error handler with standard JSON format
│   ├── modules/
│   │   ├── recipes/               # Recipe domain (6 APIs)
│   │   │   ├── recipe.router.js
│   │   │   ├── recipe.controller.js
│   │   │   ├── recipe.service.js
│   │   │   └── recipe.validation.js
│   │   ├── categories/            # Category domain (6 APIs)
│   │   │   ├── category.router.js
│   │   │   ├── category.controller.js
│   │   │   ├── category.service.js
│   │   │   └── category.validation.js
│   │   ├── ingredients/           # Ingredient domain (6 APIs)
│   │   │   ├── ingredient.router.js
│   │   │   ├── ingredient.controller.js
│   │   │   ├── ingredient.service.js
│   │   │   └── ingredient.validation.js
│   │   ├── favorites/             # Favorite domain (6 APIs)
│   │   │   ├── favorite.router.js
│   │   │   ├── favorite.controller.js
│   │   │   ├── favorite.service.js
│   │   │   └── favorite.validation.js
│   │   ├── reviews/               # Review domain (6 APIs)
│   │   │   ├── review.router.js
│   │   │   ├── review.controller.js
│   │   │   ├── review.service.js
│   │   │   └── review.validation.js
│   │   └── members/               # Member domain (6 APIs, separate)
│   │       ├── member.router.js
│   │       ├── member.controller.js
│   │       ├── member.service.js
│   │       └── member.validation.js
│   ├── routes/
│   │   └── index.js               # Central API router mounting all modules
│   └── utils/
│       ├── ApiError.js            # Standardized API error class
│       └── asyncHandler.js        # Async route handler wrapper
├── tests/
│   ├── setup.js                   # Test database fixtures and cleanup
│   ├── helpers/
│   │   └── test-auth.js           # Auth helpers for JWT test tokens
│   ├── recipe.test.js             # Recipe router tests
│   ├── category.test.js           # Category router tests
│   ├── ingredient.test.js         # Ingredient router tests
│   ├── favorite.test.js           # Favorite router tests
│   ├── review.test.js             # Review router tests
│   └── member.test.js             # Member router tests
├── docs/
│   └── openapi.yaml               # OpenAPI 3.0 specification
├── public/                        # Web application frontend
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Database Design (8 Tables)

| Table | Purpose | Key Constraints & Relations |
|---|---|---|
| `users` | User credentials and role (`MEMBER`, `ADMIN`) | `username` UNIQUE, `email` UNIQUE |
| `categories` | Recipe categories (e.g., Korean, Western) | `name` UNIQUE |
| `recipes` | Core recipe information | FK `categoryId`, FK `createdById` |
| `ingredients` | Ingredient directory and default units | `name` UNIQUE |
| `recipe_ingredients` | Many-to-many junction between Recipe and Ingredient | UNIQUE(`recipeId`, `ingredientId`), Cascade delete with Recipe |
| `recipe_steps` | Ordered cooking steps | UNIQUE(`recipeId`, `stepNumber`), Cascade delete with Recipe |
| `favorites` | Member saved recipes | UNIQUE(`userId`, `recipeId`), Cascade delete with Recipe/User |
| `reviews` | Recipe star ratings (1–5) and comments | UNIQUE(`userId`, `recipeId`), Cascade delete with Recipe/User |

---

## 5. API Specification & Endpoints (36 Total)

### 5.1 Recipe Router (`/api/recipes`) — 6 Endpoints
| API ID | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| RCP-01 | `GET` | `/api/recipes` | Public | List recipes with filters (`categoryId`, `difficulty`, `sort`) and pagination |
| RCP-02 | `GET` | `/api/recipes/:id` | Public | Recipe details with category, ingredients, steps, and average rating |
| RCP-03 | `POST` | `/api/recipes` | Admin | Create recipe with ingredients and steps in a transaction |
| RCP-04 | `PUT` | `/api/recipes/:id` | Admin | Update recipe details, ingredients, and steps in a transaction |
| RCP-05 | `DELETE` | `/api/recipes/:id` | Admin | Delete recipe and cascade delete steps, ingredients, favorites, and reviews |
| RCP-06 | `GET` | `/api/recipes/search` | Public | Search recipes by keyword, category, difficulty, and prep time |

### 5.2 Category Router (`/api/categories`) — 6 Endpoints
| API ID | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| CAT-01 | `GET` | `/api/categories` | Public | List all categories with recipe counts and pagination |
| CAT-02 | `GET` | `/api/categories/:id` | Public | Get single category details |
| CAT-03 | `POST` | `/api/categories` | Admin | Create a new category (unique name check) |
| CAT-04 | `PUT` | `/api/categories/:id` | Admin | Update category name and description |
| CAT-05 | `DELETE` | `/api/categories/:id` | Admin | Delete category (returns 409 if recipes still reference it) |
| CAT-06 | `GET` | `/api/categories/:id/recipes` | Public | Get recipes belonging to a specific category |

### 5.3 Ingredient Router (`/api/ingredients`) — 6 Endpoints
| API ID | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| ING-01 | `GET` | `/api/ingredients` | Public | List all ingredients with pagination |
| ING-02 | `GET` | `/api/ingredients/:id` | Public | Get single ingredient details |
| ING-03 | `POST` | `/api/ingredients` | Admin | Create new ingredient with default unit (unique name) |
| ING-04 | `PUT` | `/api/ingredients/:id` | Admin | Update ingredient name, description, or unit |
| ING-05 | `DELETE` | `/api/ingredients/:id` | Admin | Delete ingredient (returns 409 if used in recipes) |
| ING-06 | `GET` | `/api/ingredients/search` | Public | Search ingredients by keyword |

### 5.4 Favorite Router (`/api/favorites`) — 6 Endpoints
| API ID | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| FAV-01 | `GET` | `/api/favorites` | Member | List current user's saved recipes with pagination |
| FAV-02 | `GET` | `/api/favorites/:id` | Member | Get favorite item details (404 if not owned by user) |
| FAV-03 | `POST` | `/api/favorites` | Member | Add recipe to favorites (returns 409 if already favorited) |
| FAV-04 | `DELETE` | `/api/favorites/:id` | Member | Remove favorite by favorite ID |
| FAV-05 | `GET` | `/api/favorites/recipe/:recipeId` | Member | Check if recipe is favorited (`isFavorite: true/false`) |
| FAV-06 | `DELETE` | `/api/favorites/recipe/:recipeId` | Member | Remove recipe from favorites by recipe ID |

### 5.5 Review Router (`/api/reviews`) — 6 Endpoints
| API ID | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| REV-01 | `GET` | `/api/reviews/recipe/:recipeId` | Public | Get all reviews and rating summary for a recipe |
| REV-02 | `GET` | `/api/reviews/:id` | Public | Get single review details |
| REV-03 | `POST` | `/api/reviews` | Member | Create review (rating 1–5; 409 if already reviewed) |
| REV-04 | `PUT` | `/api/reviews/:id` | Member | Update own review (404 if not owner) |
| REV-05 | `DELETE` | `/api/reviews/:id` | Member/Admin | Delete review (owner or Admin moderation; 403 if unauthorized) |
| REV-06 | `GET` | `/api/reviews/my-reviews` | Member | List current user's reviews with pagination |

### 5.6 Member Router (`/api/members`) — 6 Endpoints (Separate)
| API ID | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| MEM-01 | `POST` | `/api/members/register` | Public | Register new account (role defaults to `MEMBER`) |
| MEM-02 | `POST` | `/api/members/login` | Public | Authenticate user and return signed JWT accessToken |
| MEM-03 | `GET` | `/api/members/me` | Member/Admin | Get current authenticated user profile |
| MEM-04 | `PUT` | `/api/members/me` | Member/Admin | Update profile username or email |
| MEM-05 | `PUT` | `/api/members/change-password` | Member/Admin | Change password with current password verification |
| MEM-06 | `POST` | `/api/members/logout` | Member/Admin | Stateless logout endpoint |

---

## 6. Authentication & Security Design

- **Stateless JWT**: Access tokens carry `{ userId, role, username, email }` signed with a secure server secret.
- **Client Token Handling**: Tokens are sent via the standard HTTP header:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Logout Behavior**: In this stateless architecture, logout removes the token on the client. For token invalidation prior to expiration, token blacklists (e.g. Redis) or refresh token revocation can be added.
- **Admin Elevation Protection**: Public registration strictly assigns `role: 'MEMBER'`. `userId` is never trusted from request body/query for user-owned operations.
- **Password Protection**: Passwords are encrypted with `bcrypt` (10 salt rounds). `passwordHash` is excluded from all API responses.

---

## 7. Getting Started

### 7.1 Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **MySQL**: 8.0 running locally on port 3306

### 7.2 Installation
```bash
# Clone or navigate to the project directory
cd recipe-management-system

# Install dependencies
npm install
```

### 7.3 Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure database connection parameters match your local MySQL configuration:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:yourpassword@localhost:3306/recipe_db"
TEST_DATABASE_URL="mysql://root:yourpassword@localhost:3306/recipe_test_db"
JWT_SECRET="super-secret-jwt-key-for-cooking-recipe-system"
JWT_EXPIRES_IN="7d"
```

### 7.4 Database Migrations & Seeding
```bash
# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample categories, ingredients, recipes, and users
npm run seed
```

### 7.5 Running the Server
```bash
# Start server in production mode
npm start

# Or start in development mode with nodemon
npm run dev
```
The server will start at `http://localhost:3000`.
- Web UI: `http://localhost:3000`
- Swagger UI Documentation: `http://localhost:3000/api-docs`

---

## 8. Test Execution & Results

Automated integration tests run against an isolated MySQL database (`recipe_test_db`) using Jest and Supertest.

```bash
# Run all tests sequentially
npm test

# Run tests with coverage report
npm run test:coverage
```

### Test Results Summary
```text
 PASS  tests/review.test.js (9 tests)
 PASS  tests/recipe.test.js (8 tests)
 PASS  tests/favorite.test.js (8 tests)
 PASS  tests/member.test.js (10 tests)
 PASS  tests/category.test.js (9 tests)
 PASS  tests/ingredient.test.js (7 tests)

Test Suites: 6 passed, 6 total
Tests:       51 passed, 51 total
Snapshots:   0 total
Time:        18.928 s
Ran all test suites.
```

---

## 9. Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `AdminPassword123` |
| **Member** | `foodlover@example.com` | `StrongPassword123` |
