import { createClient } from 'redis';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { createCatalogService } from './catalog/catalogService.js';
import { environment } from './config/environment.js';

const database = new Pool({ connectionString: environment.databaseUrl });
const cache = createClient({ url: environment.redisUrl });
const prisma = new PrismaClient();

cache.on('error', (error) => console.error('Redis error:', error.message));
await cache.connect();
await database.query('SELECT 1');

const catalogService = createCatalogService({ prisma, cache });
const app = createApp({ ...environment, catalogService });
const server = app.listen(environment.port, () => {
  console.log(`Carsport API listening on port ${environment.port}`);
});

async function shutdown() {
  server.close();
  await Promise.all([cache.quit(), database.end(), prisma.$disconnect()]);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
