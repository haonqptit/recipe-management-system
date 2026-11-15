const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
  console.log(`API documentation available at http://localhost:${env.port}/api-docs`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

module.exports = server;
