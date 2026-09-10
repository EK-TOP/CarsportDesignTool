import { Router } from 'express';
import { isCuid } from '../utils/validation.js';


export function createPricingRouter(pricingService) {
  const router = Router();
  const requireUser = (request, response, next) => request.user ? next() : response.status(401).json({ error: 'Authentication is required' });
  router.post('/vehicles/:vehicleId/configurations/:configurationId/quote', requireUser, async (request, response, next) => {
    try {
      const { vehicleId, configurationId } = request.params;
      if (!isCuid(vehicleId) || !isCuid(configurationId)) return response.status(400).json({ error: 'Invalid configuration identifier' });
      const result = await pricingService.createQuote(vehicleId, configurationId, request.user.sub);
      if (!result) return response.status(404).json({ error: 'Configuration not found' });
      if (!result.quote) return response.status(422).json({ data: result.configuration });
      return response.status(201).json({ data: result.quote });
    } catch (error) {
      return next(error);
    }
  });
  return router;
}
