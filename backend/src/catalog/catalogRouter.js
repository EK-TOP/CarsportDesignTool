import { Router } from 'express';
import { Readable } from 'node:stream';
import { isCuid } from '../utils/validation.js';

const trustedModelHost = 'raw.githubusercontent.com';

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
      if (!isCuid(vehicleId)) return response.status(400).json({ error: 'Invalid vehicle ID' });

      const vehicle = await catalogService.getVehicle(vehicleId);
      if (!vehicle) return response.status(404).json({ error: 'Vehicle not found' });
      return response.json({ data: vehicle });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/assets/:assetId/model.glb', async (request, response, next) => {
    try {
      const { assetId } = request.params;
      if (!isCuid(assetId)) return response.status(400).json({ error: 'Invalid asset ID' });

      const asset = await catalogService.getModelAsset(assetId);
      if (!asset) return response.status(404).json({ error: 'Model asset not found' });

      const source = new URL(asset.uri);
      if (source.protocol !== 'https:' || source.hostname !== trustedModelHost) {
        return response.status(502).json({ error: 'Model asset source is not supported' });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      let upstream;
      try {
        upstream = await fetch(source, { signal: controller.signal });
      } catch (error) {
        if (error.name === 'AbortError') return response.status(504).json({ error: 'Model asset request timed out' });
        throw error;
      } finally {
        clearTimeout(timeout);
      }
      if (!upstream.ok || !upstream.body) return response.status(502).json({ error: 'Model asset is unavailable' });

      response.set({
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': asset.mimeType
      });
      const contentLength = upstream.headers.get('content-length');
      if (contentLength) response.set('Content-Length', contentLength);
      return Readable.fromWeb(upstream.body).on('error', next).pipe(response);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
