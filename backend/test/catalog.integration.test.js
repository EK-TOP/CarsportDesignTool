import assert from 'node:assert/strict';
import test from 'node:test';

const apiUrl = process.env.CATALOG_API_URL ?? 'http://localhost:4000';

test('catalog lists the seeded Demo Sport vehicle', async () => {
  const response = await fetch(`${apiUrl}/api/vehicles`);
  assert.equal(response.status, 200);

  const { data } = await response.json();
  assert.ok(data.some((vehicle) => vehicle.sku === 'DEMO-SPORT-01'));
});

test('catalog returns compatible parts for the seeded Demo Sport vehicle', async () => {
  const listResponse = await fetch(`${apiUrl}/api/vehicles`);
  const { data: vehicles } = await listResponse.json();
  const demoSport = vehicles.find((vehicle) => vehicle.sku === 'DEMO-SPORT-01');

  const response = await fetch(`${apiUrl}/api/vehicles/${demoSport.id}`);
  assert.equal(response.status, 200);

  const { data } = await response.json();
  assert.equal(data.sku, 'DEMO-SPORT-01');
  assert.equal(data.parts.length, 2);
});
