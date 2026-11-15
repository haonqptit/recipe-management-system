const { PrismaClient } = require('@prisma/client');
const env = require('../config/env');

const databaseUrl = (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL)
  ? process.env.TEST_DATABASE_URL
  : env.databaseUrl;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
