import 'dotenv/config';

const required = ['DATABASE_URL', 'REDIS_URL', 'CLIENT_ORIGIN'];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const environment = Object.freeze({
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  clientOrigin: process.env.CLIENT_ORIGIN,
  connectionTimeoutMs: Number(process.env.CONNECTION_TIMEOUT_MS ?? 5000)
});
