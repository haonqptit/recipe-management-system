const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const routes = require('./routes');
const notFoundHandler = require('./middlewares/not-found.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory if exists
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Swagger API Documentation
const openApiPath = path.join(__dirname, '../docs/openapi.yaml');
if (fs.existsSync(openApiPath)) {
  try {
    const swaggerDocument = YAML.load(openApiPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    console.error('Failed to load OpenAPI spec:', err.message);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount domain routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
