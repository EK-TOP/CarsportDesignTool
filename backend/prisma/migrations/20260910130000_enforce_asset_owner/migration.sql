-- Every asset must belong to exactly one catalog entity.
ALTER TABLE "Asset"
ADD CONSTRAINT "Asset_exactly_one_owner"
CHECK (("vehicleId" IS NOT NULL)::integer + ("partId" IS NOT NULL)::integer = 1);