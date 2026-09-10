import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createAuthRouter } from './auth/authRouter.js';
import { createCatalogRouter } from './catalog/catalogRouter.js';
import { createConfigurationRouter } from './configuration/configurationRouter.js';
import { createPricingRouter } from './pricing/pricingRouter.js';

export function createApp({ clientOrigin, jwtSecret, catalogService, configurationService, pricingService, authService }) {
  const app = express();

  app.use(cors({ origin: clientOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use((request, _response, next) => { const token = request.cookies.carsport_access; if (!token) return next(); try { request.user = jwt.verify(token, jwtSecret); } catch { request.user = null; } return next(); });

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok', service: 'carsport-backend' });
  });

  app.use('/api', createCatalogRouter(catalogService));
  app.use('/api', createAuthRouter(authService));
  app.use('/api', createConfigurationRouter(configurationService));
  app.use('/api', createPricingRouter(pricingService));

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: 'An unexpected server error occurred' });
  });

  return app;
}
