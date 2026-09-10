import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parts = [
  { sku: 'SPOILER-CARBON-01', name: 'Carbon rear spoiler', category: 'aerodynamics', description: 'Track-inspired carbon-fibre rear spoiler.', priceCents: 129900 },
  { sku: 'WHEEL-FORGED-19', name: 'Forged 19-inch wheels', category: 'wheels', description: 'Lightweight forged alloy wheel set.', priceCents: 249900 }
];

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
}

main()
  .then(() => console.log('Demo catalog seeded.'))
  .finally(async () => prisma.$disconnect());
