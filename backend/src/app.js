import cors from 'cors';
import express from 'express';
import { createCatalogRouter } from './catalog/catalogRouter.js';

export function createApp({ clientOrigin, catalogService }) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok', service: 'carsport-backend' });
  });

  app.use('/api', createCatalogRouter(catalogService));

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: 'An unexpected server error occurred' });
  });

  return app;
}
