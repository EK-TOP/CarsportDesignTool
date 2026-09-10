import assert from 'node:assert/strict';
import test from 'node:test';

const apiUrl = process.env.CATALOG_API_URL ?? 'http://localhost:4000';
let authCookie;

async function authenticationHeaders() {
  if (!authCookie) {
    const identity = `sales-${Date.now()}@example.test`;
    const response = await fetch(`${apiUrl}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: identity, username: `sales${Date.now()}`, password: 'test-password-123' }) });
    authCookie = response.headers.get('set-cookie');
  }
  return { 'Content-Type': 'application/json', Cookie: authCookie };
}

async function demoSport() {
  const response = await fetch(`${apiUrl}/api/vehicles`);
  const { data } = await response.json();
  return data.find((vehicle) => vehicle.sku === 'DEMO-SPORT-01');
}

test('persists a valid compatible-part configuration', async () => {
  const vehicle = await demoSport();
  const detail = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}`).then((response) => response.json());
  const spoiler = detail.data.parts.find((part) => part.category === 'aerodynamics');
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}/configurations`, { method: 'POST', headers: await authenticationHeaders(), body: JSON.stringify({ placements: [{ partId: spoiler.id, zoneCode: 'rear-aero' }] }) });
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
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}/configurations`, { method: 'POST', headers: await authenticationHeaders(), body: JSON.stringify({ placements: [{ partId: spoiler.id, zoneCode: 'wheels' }] }) });
  assert.equal(response.status, 422);
  const { data } = await response.json();
  assert.equal(data.valid, false);
  assert.ok(data.errors.some((error) => error.code === 'INVALID_ZONE'));
});

test('creates an itemized quote for a valid configuration', async () => {
  const vehicle = await demoSport();
  const detail = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}`).then((response) => response.json());
  const spoiler = detail.data.parts.find((part) => part.category === 'aerodynamics');
  const configurationResponse = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}/configurations`, { method: 'POST', headers: await authenticationHeaders(), body: JSON.stringify({ placements: [{ partId: spoiler.id, zoneCode: 'rear-aero' }] }) });
  const { data: configuration } = await configurationResponse.json();
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicle.id}/configurations/${configuration.id}/quote`, { method: 'POST', headers: { Cookie: authCookie } });
  assert.equal(response.status, 201);
  const { data } = await response.json();
  assert.equal(data.totalCents, 4728900);
  assert.equal(data.lineItems.length, 2);
});
