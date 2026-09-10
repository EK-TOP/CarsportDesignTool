import assert from 'node:assert/strict';
import test from 'node:test';

const apiUrl = process.env.CATALOG_API_URL ?? 'http://localhost:4000';

async function demoSport() {
  const response = await fetch(`${apiUrl}/api/vehicles`);
  const { data } = await response.json();
  return data.find((vehicle) => vehicle.sku === 'DEMO-SPORT-01');
}

test('persists a valid compatible-part configuration', async () => {
  const vehicle = await demoSport();
  const detail = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}`).then((response) => response.json());
  const spoiler = detail.data.parts.find((part) => part.category === 'aerodynamics');
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}/configurations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placements: [{ partId: spoiler.id, zoneCode: 'rear-aero' }] }) });
  assert.equal(response.status, 201);
  const { data } = await response.json();
  assert.equal(data.valid, true);
  assert.equal(data.errors.length, 0);
  assert.ok(data.id);
});

test('returns structured errors for an invalid placement zone', async () => {
  const vehicle = await demoSport();
  const detail = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}`).then((response) => response.json());
  const spoiler = detail.data.parts.find((part) => part.category === 'aerodynamics');
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}/configurations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placements: [{ partId: spoiler.id, zoneCode: 'wheels' }] }) });
  assert.equal(response.status, 422);
  const { data } = await response.json();
  assert.equal(data.valid, false);
  assert.ok(data.errors.some((error) => error.code === 'INVALID_ZONE'));
});
