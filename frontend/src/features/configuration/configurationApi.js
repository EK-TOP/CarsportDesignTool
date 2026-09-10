import { z } from 'zod';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const validationSchema = z.object({ id: z.string(), valid: z.boolean(), warnings: z.array(z.object({ code: z.string(), message: z.string() })), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
const quoteSchema = z.object({ id: z.string(), currency: z.string(), subtotalCents: z.number().int(), discountCents: z.number().int(), totalCents: z.number().int(), lineItems: z.array(z.object({ type: z.string(), label: z.string(), amountCents: z.number().int() })) });

export async function saveConfiguration(vehicleId, placements) {
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}/configurations`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placements })
  });
  if (!response.ok && response.status !== 422) throw new Error('Unable to save the configuration.');
  const { data } = await response.json();
  return validationSchema.parse(data);
}

export async function createQuote(vehicleId, configurationId) {
  const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}/configurations/${configurationId}/quote`, { method: 'POST', credentials: 'include' });
  if (!response.ok) throw new Error('Unable to calculate the quote.');
  const { data } = await response.json();
  return quoteSchema.parse(data);
}
