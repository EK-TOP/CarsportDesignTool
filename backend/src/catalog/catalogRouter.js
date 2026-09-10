import { Router } from 'express';

const cuidPattern = /^c[a-z0-9]{24}$/;

export function createCatalogRouter(catalogService) {
  const router = Router();

  router.get('/vehicles', async (_request, response, next) => {
    try {
      response.json({ data: await catalogService.listVehicles() });
    } catch (error) {
      next(error);
    }
  });

  router.get('/vehicles/:vehicleId', async (request, response, next) => {
    try {
      const { vehicleId } = request.params;
      if (!cuidPattern.test(vehicleId)) return response.status(400).json({ error: 'Invalid vehicle ID' });

      const vehicle = await catalogService.getVehicle(vehicleId);
      if (!vehicle) return response.status(404).json({ error: 'Vehicle not found' });
      return response.json({ data: vehicle });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
