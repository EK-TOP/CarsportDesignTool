const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function saveConfiguration(vehicleId, placements) {
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}/configurations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placements })
  });
  if (!response.ok && response.status !== 422) throw new Error('Unable to save the configuration.');
  const { data } = await response.json();
  return data;
}

export async function createQuote(vehicleId, configurationId) {
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}/configurations/${configurationId}/quote`, { method: 'POST' });
  if (!response.ok) throw new Error('Unable to calculate the quote.');
  const { data } = await response.json();
  return data;
}
