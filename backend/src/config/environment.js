import 'dotenv/config';

const required = ['DATABASE_URL'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const environment = Object.freeze({
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL ?? 'redis://redis:6379',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
});
