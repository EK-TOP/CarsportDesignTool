const cuidPattern = /^c[a-z0-9]{24}$/;

function message(code, message) {
  return { code, message };
}

export function createConfigurationService({ prisma }) {
  async function evaluate(vehicleId, placements) {
    const errors = [];
    const warnings = [];
    const [compatibleParts, zones] = await Promise.all([
      prisma.vehiclePart.findMany({ where: { vehicleId, part: { isActive: true } }, include: { part: true } }),
      prisma.placementZone.findMany({ where: { vehicleId } })
    ]);
    const partById = new Map(compatibleParts.map(({ part }) => [part.id, part]));
    const zoneByCode = new Map(zones.map((zone) => [zone.code, zone]));
    const usedParts = new Set();
    const zoneUsage = new Map();

    if (placements.length === 0) warnings.push(message('NO_PARTS_SELECTED', 'No compatible parts have been selected.'));

    for (const placement of placements) {
      const part = partById.get(placement.partId);
      if (!part) {
        errors.push(message('INCOMPATIBLE_PART', 'A selected part is not compatible with this vehicle.'));
        continue;
      }
      if (usedParts.has(part.id)) errors.push(message('DUPLICATE_PART', `${part.name} can only be selected once.`));
      usedParts.add(part.id);

      const zone = zoneByCode.get(placement.zoneCode);
      if (!zone) {
        errors.push(message('UNKNOWN_ZONE', 'The selected placement zone does not belong to this vehicle.'));
        continue;
      }
      if (zone.allowedCategory !== part.category) errors.push(message('INVALID_ZONE', `${part.name} cannot be placed in ${zone.name}.`));
      zoneUsage.set(zone.code, (zoneUsage.get(zone.code) ?? 0) + 1);
    }

    for (const zone of zones) {
      if (zone.isExclusive && (zoneUsage.get(zone.code) ?? 0) > 1) errors.push(message('ZONE_OCCUPIED', `${zone.name} accepts only one part.`));
    }
    return { valid: errors.length === 0, warnings, errors };
  }

  async function save(vehicleId, placements) {
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, isActive: true } });
    if (!vehicle) return null;
    const validation = await evaluate(vehicleId, placements);
    const configuration = await prisma.configuration.create({ data: { vehicleId, payload: { placements } } });
    return { id: configuration.id, vehicleId, placements, ...validation };
  }

  async function get(vehicleId, configurationId) {
    if (!cuidPattern.test(configurationId)) return undefined;
    const configuration = await prisma.configuration.findFirst({ where: { id: configurationId, vehicleId } });
    if (!configuration) return null;
    const placements = Array.isArray(configuration.payload.placements) ? configuration.payload.placements : [];
    return { id: configuration.id, vehicleId, placements, ...await evaluate(vehicleId, placements) };
  }

  return { save, get };
}
