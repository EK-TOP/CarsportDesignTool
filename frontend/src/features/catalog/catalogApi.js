import { z } from 'zod';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const vehicleSummarySchema = z.object({ id: z.string(), sku: z.string(), name: z.string(), description: z.string().nullable(), basePriceCents: z.number().int(), currency: z.string(), thumbnail: z.string().nullable() });
const vehicleSchema = vehicleSummarySchema.extend({ assets: z.array(z.object({ id: z.string(), type: z.string(), uri: z.string(), mimeType: z.string().nullable() })), parts: z.array(z.object({ id: z.string(), sku: z.string(), name: z.string(), category: z.string(), description: z.string().nullable(), priceCents: z.number().int() })) });

export function getModelAssetUrl(assetId) {
  return `${apiUrl}/api/assets/${assetId}/model.glb`;
}

export async function fetchVehicles(signal) {
  const response = await fetch(`${apiUrl}/api/vehicles`, { signal });
  if (!response.ok) throw new Error('Unable to load the vehicle catalog.');

  const { data } = await response.json();
  return z.array(vehicleSummarySchema).parse(data);
}

export async function fetchVehicle(vehicleId, signal) {
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}`, { signal });
  if (!response.ok) throw new Error('Unable to load the selected vehicle.');

  const { data } = await response.json();
  return vehicleSchema.parse(data);
}
