const vehiclesCacheKey = 'catalog:vehicles';
const cacheTtlSeconds = 60;

function toVehicleSummary(vehicle) {
  return {
    id: vehicle.id,
    sku: vehicle.sku,
    name: vehicle.name,
    description: vehicle.description,
    basePriceCents: vehicle.basePriceCents,
    currency: vehicle.currency,
    thumbnail: vehicle.assets.find((asset) => asset.type === 'thumbnail')?.uri ?? null
  };
}

export function createCatalogService({ prisma, cache }) {
  async function listVehicles() {
    try {
      const cached = await cache.get(vehiclesCacheKey);
      if (cached) return JSON.parse(cached);
    } catch (error) {
      console.warn('Catalog cache read failed; querying database:', error.message);
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      include: { assets: true },
      orderBy: { name: 'asc' }
    });
    const result = vehicles.map(toVehicleSummary);
    try {
      await cache.set(vehiclesCacheKey, JSON.stringify(result), { EX: cacheTtlSeconds });
    } catch (error) {
      console.warn('Catalog cache write failed; returning database result:', error.message);
    }
    return result;
  }

  async function getVehicle(id) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, isActive: true },
      include: {
        assets: true,
        vehicleParts: {
          include: { part: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!vehicle) return null;

    return {
      ...toVehicleSummary(vehicle),
      assets: vehicle.assets.map(({ id: assetId, type, uri, mimeType }) => ({ id: assetId, type, uri, mimeType })),
      parts: vehicle.vehicleParts
        .map(({ part }) => part)
        .filter((part) => part.isActive)
        .map(({ id: partId, sku, name, category, description, priceCents }) => ({ id: partId, sku, name, category, description, priceCents }))
    };
  }

  async function invalidateVehicles() {
    try {
      await cache.del(vehiclesCacheKey);
    } catch (error) {
      console.warn('Catalog cache invalidation failed:', error.message);
    }
  }

  return { listVehicles, getVehicle, invalidateVehicles };
}
