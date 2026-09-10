const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function fetchVehicles(signal) {
  const response = await fetch(`${apiUrl}/api/vehicles`, { signal });
  if (!response.ok) throw new Error('Unable to load the vehicle catalog.');

  const { data } = await response.json();
  return data;
}
