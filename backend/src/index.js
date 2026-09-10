import { createClient } from 'redis';
import { Pool } from 'pg';
import { createApp } from './app.js';
import { environment } from './config/environment.js';

const database = new Pool({ connectionString: environment.databaseUrl });
const cache = createClient({ url: environment.redisUrl });

cache.on('error', (error) => console.error('Redis error:', error.message));
await cache.connect();
await database.query('SELECT 1');

const app = createApp(environment);
const server = app.listen(environment.port, () => {
  console.log(`Carsport API listening on port ${environment.port}`);
});

async function shutdown() {
  server.close();
  await Promise.all([cache.quit(), database.end()]);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
