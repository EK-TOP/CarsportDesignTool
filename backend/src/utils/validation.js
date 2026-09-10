export const cuidPattern = /^c[a-z0-9]{24}$/;

export function isCuid(value) {
  return typeof value === 'string' && cuidPattern.test(value);
}

export function isVehicleSummaryList(value) {
  return Array.isArray(value) && value.every((vehicle) => vehicle && typeof vehicle.id === 'string' && typeof vehicle.sku === 'string' && typeof vehicle.name === 'string' && Number.isInteger(vehicle.basePriceCents) && typeof vehicle.currency === 'string');
}
