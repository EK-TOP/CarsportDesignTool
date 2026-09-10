import cors from 'cors';
import express from 'express';

export function createApp({ clientOrigin }) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok', service: 'carsport-backend' });
  });

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });

  return app;
}
