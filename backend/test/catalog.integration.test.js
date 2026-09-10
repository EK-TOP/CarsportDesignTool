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
  assert.ok(data.assets.some((asset) => asset.type === 'model' && asset.uri === 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb'));
});

test('catalog streams the seeded Demo Sport model through the local API', async () => {
  const listResponse = await fetch(`${apiUrl}/api/vehicles`);
  const { data: vehicles } = await listResponse.json();
  const demoSport = vehicles.find((vehicle) => vehicle.sku === 'DEMO-SPORT-01');
  const detailResponse = await fetch(`${apiUrl}/api/vehicles/${demoSport.id}`);
  const { data } = await detailResponse.json();
  const modelAsset = data.assets.find((asset) => asset.type === 'model');

  const response = await fetch(`${apiUrl}/api/assets/${modelAsset.id}/model.glb`);
  const errorBody = response.ok ? '' : await response.text();
  assert.equal(response.status, 200, errorBody);
  assert.equal(response.headers.get('content-type'), 'model/gltf-binary');
  const model = new Uint8Array(await response.arrayBuffer());
  assert.ok(model.byteLength > 0, 'The model response should contain data.');
  assert.deepEqual([...model.slice(0, 4)], [0x67, 0x6c, 0x54, 0x46], 'The response should be a binary glTF file.');
});
