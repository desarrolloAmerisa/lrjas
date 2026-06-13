-- Add date_mexico for one attendance per user per calendar day (America/Mexico_City)
ALTER TABLE "attendances" ADD COLUMN "date_mexico" TEXT;

UPDATE "attendances"
SET "date_mexico" = to_char("created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD');

DELETE FROM "attendances" a
USING "attendances" b
WHERE a."participant_id" = b."participant_id"
  AND a."date_mexico" = b."date_mexico"
  AND a."created_at" > b."created_at";

ALTER TABLE "attendances" ALTER COLUMN "date_mexico" SET NOT NULL;

CREATE UNIQUE INDEX "attendances_participant_id_date_mexico_key" ON "attendances"("participant_id", "date_mexico");
