import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { createCatalogService } from './catalog/catalogService.js';
import { createConfigurationService } from './configuration/configurationService.js';
import { environment } from './config/environment.js';

const cache = createClient({
  url: environment.redisUrl,
  socket: { connectTimeout: environment.connectionTimeoutMs }
});
const databaseUrl = new URL(environment.databaseUrl);
databaseUrl.searchParams.set('connect_timeout', String(Math.ceil(environment.connectionTimeoutMs / 1000)));
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl.toString() } } });

cache.on('error', (error) => console.error('Redis error:', error.message));
let server;

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    try {
      await cache.connect();
    } catch (error) {
      console.warn('Redis unavailable; catalog cache is disabled:', error.message);
    }

    const catalogService = createCatalogService({ prisma, cache });
    const configurationService = createConfigurationService({ prisma });
    const app = createApp({ ...environment, catalogService, configurationService });
    server = app.listen(environment.port, () => {
      console.log(`Carsport API listening on port ${environment.port}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error);
    await Promise.allSettled([cache.isOpen ? cache.quit() : Promise.resolve(), prisma.$disconnect()]);
    process.exitCode = 1;
  }
}

async function shutdown() {
  const closeServer = server
    ? new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    : Promise.resolve();
  const results = await Promise.allSettled([
    closeServer,
    cache.isOpen ? cache.quit() : Promise.resolve(),
    prisma.$disconnect()
  ]);
  results.filter((result) => result.status === 'rejected').forEach((result) => console.error('Shutdown error:', result.reason));
}

void start();
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
