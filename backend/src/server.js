'use strict';

const app = require('./app');
const config = require('./config/env');
const { initDatabase } = require('./models');
const drugCatalog = require('./services/drugCatalog');

// Boots the server: connect + sync the DB, warm the drug-catalog cache, then
// start listening. A microservice that's down at boot is tolerated; a DB that
// can't be reached is fatal (the cache layer can't function without it).
async function start() {
  try {
    await initDatabase();
    console.log('[db] connected and schema synced.');
  } catch (err) {
    console.error('[db] FATAL: could not connect to PostgreSQL:', err.message);
    console.error('      Check your DATABASE_URL / PG* settings in .env.');
    process.exit(1);
  }

  // Best-effort warm-up — never blocks startup if the microservice is offline.
  const warm = await drugCatalog.warmUp();
  if (warm.ok) {
    console.log('[catalog] drug list pre-loaded from microservice.');
  } else {
    console.warn(
      `[catalog] could not pre-load drug list (${warm.error}). ` +
        'It will be fetched on the first /api/drugs request.'
    );
  }

  const server = app.listen(config.port, () => {
    console.log(`[server] orchestrator listening on http://localhost:${config.port}`);
    console.log(`[server] proxying ML microservice at ${config.ml.baseUrl}`);
  });

  // Graceful shutdown so nodemon/Ctrl-C don't leave a dangling port.
  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Surface unexpected failures rather than dying silently.
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandled promise rejection:', reason);
});

start();
