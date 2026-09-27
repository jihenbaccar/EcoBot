CREATE TYPE "MissionApproval" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'INVALIDE');

ALTER TABLE "missions"
  ADD COLUMN "approval" "MissionApproval" NOT NULL DEFAULT 'EN_ATTENTE',
  ADD COLUMN "reviewComment" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE TABLE "mission_photos" (
  "id" SERIAL NOT NULL,
  "missionId" INTEGER NOT NULL,
  "dataUrl" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mission_photos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "mission_photos_missionId_idx" ON "mission_photos"("missionId");
ALTER TABLE "mission_photos" ADD CONSTRAINT "mission_photos_missionId_fkey"
  FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notifications" (
  "id" SERIAL NOT NULL,
  "recipientId" INTEGER,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "missionId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_recipientId_createdAt_idx" ON "notifications"("recipientId", "createdAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey"
  FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;