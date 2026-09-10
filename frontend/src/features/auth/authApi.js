const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function authenticate(mode, values) {
  const response = await fetch(`${apiUrl}/api/auth/${mode}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
  const { data, error } = await response.json();
  if (!response.ok) throw new Error(error ?? 'Authentication failed.');
  return data;
}
