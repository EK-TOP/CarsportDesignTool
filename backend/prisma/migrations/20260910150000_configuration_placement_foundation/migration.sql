CREATE TABLE "PlacementAnchor" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementAnchor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlacementZone" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "anchorCode" TEXT NOT NULL,
    "allowedCategory" TEXT NOT NULL,
    "isExclusive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementZone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlacementAnchor_vehicleId_code_key" ON "PlacementAnchor"("vehicleId", "code");
CREATE INDEX "PlacementAnchor_vehicleId_idx" ON "PlacementAnchor"("vehicleId");
CREATE UNIQUE INDEX "PlacementZone_vehicleId_code_key" ON "PlacementZone"("vehicleId", "code");
CREATE INDEX "PlacementZone_vehicleId_idx" ON "PlacementZone"("vehicleId");

ALTER TABLE "PlacementAnchor" ADD CONSTRAINT "PlacementAnchor_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlacementZone" ADD CONSTRAINT "PlacementZone_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
