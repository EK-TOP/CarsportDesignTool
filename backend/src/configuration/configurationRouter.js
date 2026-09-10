import { Router } from 'express';
import { isCuid } from '../utils/validation.js';

function validPlacements(value) {
  return Array.isArray(value) && value.every((placement) => placement && isCuid(placement.partId) && typeof placement.zoneCode === 'string' && placement.zoneCode.length > 0 && placement.zoneCode.length <= 80);
}

export function createConfigurationRouter(configurationService) {
  const router = Router();

  router.post('/vehicles/:vehicleId/configurations', async (request, response, next) => {
    try {
      const { vehicleId } = request.params;
      const { placements } = request.body ?? {};
      if (!isCuid(vehicleId)) return response.status(400).json({ error: 'Invalid vehicle ID' });
      if (!validPlacements(placements)) return response.status(400).json({ error: 'placements must contain partId and zoneCode values' });
      const configuration = await configurationService.save(vehicleId, placements);
      if (!configuration) return response.status(404).json({ error: 'Vehicle not found' });
      return response.status(configuration.valid ? 201 : 422).json({ data: configuration });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/vehicles/:vehicleId/configurations/:configurationId', async (request, response, next) => {
    try {
      const { vehicleId, configurationId } = request.params;
      if (!isCuid(vehicleId) || !isCuid(configurationId)) return response.status(400).json({ error: 'Invalid configuration identifier' });
      const configuration = await configurationService.get(vehicleId, configurationId);
      if (!configuration) return response.status(404).json({ error: 'Configuration not found' });
      return response.json({ data: configuration });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
