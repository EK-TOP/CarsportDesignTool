import { Router } from 'express';

const cuidPattern = /^c[a-z0-9]{24}$/;

export function createPricingRouter(pricingService) {
  const router = Router();
  router.post('/vehicles/:vehicleId/configurations/:configurationId/quote', async (request, response, next) => {
    try {
      const { vehicleId, configurationId } = request.params;
      if (!cuidPattern.test(vehicleId) || !cuidPattern.test(configurationId)) return response.status(400).json({ error: 'Invalid configuration identifier' });
      const result = await pricingService.createQuote(vehicleId, configurationId);
      if (!result) return response.status(404).json({ error: 'Configuration not found' });
      if (!result.quote) return response.status(422).json({ data: result.configuration });
      return response.status(201).json({ data: result.quote });
    } catch (error) {
      return next(error);
    }
  });
  return router;
}
