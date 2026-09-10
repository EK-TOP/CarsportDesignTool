export function createPricingService({ prisma, configurationService }) {
  async function createQuote(vehicleId, configurationId) {
    const configuration = await configurationService.get(vehicleId, configurationId);
    if (!configuration) return null;
    if (!configuration.valid) return { configuration, quote: null };

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const partIds = configuration.placements.map((placement) => placement.partId);
    const parts = await prisma.part.findMany({ where: { id: { in: partIds }, isActive: true } });
    const lineItems = [
      { type: 'vehicle', label: vehicle.name, amountCents: vehicle.basePriceCents },
      ...parts.map((part) => ({ type: 'part', label: part.name, amountCents: part.priceCents }))
    ];
    const subtotalCents = lineItems.reduce((total, item) => total + item.amountCents, 0);
    const discountCents = 0;
    const totalCents = subtotalCents - discountCents;
    const quote = await prisma.quote.create({ data: { configurationId, currency: vehicle.currency, subtotalCents, discountCents, totalCents, payload: { lineItems } } });
    return { configuration, quote: { id: quote.id, currency: quote.currency, subtotalCents, discountCents, totalCents, lineItems } };
  }

  return { createQuote };
}
