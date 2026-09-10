import { Router } from 'express';

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
      const vehicle = await catalogService.getVehicle(request.params.vehicleId);
      if (!vehicle) return response.status(404).json({ error: 'Vehicle not found' });
      return response.json({ data: vehicle });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
