const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'test'
    ? path.resolve(process.cwd(), '.env.test')
    : path.resolve(process.cwd(), '.env'),
});

// Fallback to default .env if .env.test is missing
if (process.env.NODE_ENV === 'test' && !process.env.DATABASE_URL && process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:123123@localhost:3306/recipe_db',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-cooking-recipe-system',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
