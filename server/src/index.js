/**
 * src/index.js
 * Application entry point: connect storage, start the HTTP server and shut
 * down cleanly on SIGINT/SIGTERM.
 */
const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

async function start() {
  const storage = await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`ResumeIQ API listening on http://localhost:${env.PORT}/api`);
    console.log(`Environment: ${env.NODE_ENV} | Storage: ${storage}`);
    if (storage === 'file') {
      console.log('MongoDB not configured — using local file store at .data/db.json');
    }
  });

  server.on('error', (error) => {
    console.error('Unable to start the HTTP server:', error.message);
    process.exitCode = 1;
  });

  async function shutdown(signal) {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  }

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

start().catch((error) => {
  console.error('Failed to start ResumeIQ:', error);
  process.exit(1);
});

module.exports = app;
