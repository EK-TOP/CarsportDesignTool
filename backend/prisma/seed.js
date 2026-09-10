import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parts = [
  { sku: 'SPOILER-CARBON-01', name: 'Carbon rear spoiler', category: 'aerodynamics', description: 'Track-inspired carbon-fibre rear spoiler.', priceCents: 129900 },
  { sku: 'WHEEL-FORGED-19', name: 'Forged 19-inch wheels', category: 'wheels', description: 'Lightweight forged alloy wheel set.', priceCents: 249900 }
];

const demoSportModel = {
  uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb',
  mimeType: 'model/gltf-binary'
};

async function main() {
  const vehicle = await prisma.vehicle.upsert({
    where: { sku: 'DEMO-SPORT-01' },
    update: {},
    create: {
      sku: 'DEMO-SPORT-01',
      name: 'Demo Sport',
      description: 'A high-performance demo vehicle for the Carsport designer.',
      basePriceCents: 4599000,
      currency: 'EUR',
      assets: {
        create: {
          type: 'thumbnail',
          uri: '/assets/vehicles/demo-sport/thumbnail.jpg',
          mimeType: 'image/jpeg'
        }
      }
    }
  });

  const modelAsset = await prisma.asset.findFirst({
    where: { vehicleId: vehicle.id, type: 'model' }
  });

  if (!modelAsset) {
    await prisma.asset.create({
      data: {
        vehicleId: vehicle.id,
        type: 'model',
        ...demoSportModel
      }
    });
  } else {
    await prisma.asset.update({
      where: { id: modelAsset.id },
      data: demoSportModel
    });
  }

  for (const part of parts) {
    const savedPart = await prisma.part.upsert({
      where: { sku: part.sku },
      update: part,
      create: part
    });

    await prisma.vehiclePart.upsert({
      where: { vehicleId_partId: { vehicleId: vehicle.id, partId: savedPart.id } },
      update: {},
      create: { vehicleId: vehicle.id, partId: savedPart.id }
    });
  }

  await prisma.material.upsert({
    where: { sku: 'MAT-RACING-RED' },
    update: {},
    create: { sku: 'MAT-RACING-RED', name: 'Racing Red', hexColor: '#B20D20', priceCents: 45000 }
  });

  const anchors = [
    { code: 'rear-center', name: 'Rear center', position: { x: 0, y: 0.55, z: -1.25 } },
    { code: 'wheel-set', name: 'Wheel set', position: { x: 0, y: 0.25, z: 0 } }
  ];
  for (const anchor of anchors) {
    await prisma.placementAnchor.upsert({
      where: { vehicleId_code: { vehicleId: vehicle.id, code: anchor.code } },
      update: anchor,
      create: { vehicleId: vehicle.id, ...anchor }
    });
  }

  const zones = [
    { code: 'rear-aero', name: 'Rear aerodynamics', anchorCode: 'rear-center', allowedCategory: 'aerodynamics', isExclusive: true },
    { code: 'wheels', name: 'Wheel fitment', anchorCode: 'wheel-set', allowedCategory: 'wheels', isExclusive: true }
  ];
  for (const zone of zones) {
    await prisma.placementZone.upsert({
      where: { vehicleId_code: { vehicleId: vehicle.id, code: zone.code } },
      update: zone,
      create: { vehicleId: vehicle.id, ...zone }
    });
  }
}

main()
  .then(() => console.log('Demo catalog seeded.'))
  .finally(async () => prisma.$disconnect());
