-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERVISEUR', 'AGENT');

-- CreateEnum
CREATE TYPE "AspirateurStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OFFLINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspirateurs" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "AspirateurStatus" NOT NULL DEFAULT 'INACTIVE',
    "currentWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "batteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aspirateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "aspirateurId" INTEGER NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" BIGSERIAL NOT NULL,
    "aspirateurId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "battery" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collectes" (
    "id" SERIAL NOT NULL,
    "aspirateurId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,
    "missionId" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collectes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "aspirateurs_reference_key" ON "aspirateurs"("reference");

-- CreateIndex
CREATE INDEX "missions_agentId_idx" ON "missions"("agentId");

-- CreateIndex
CREATE INDEX "missions_aspirateurId_idx" ON "missions"("aspirateurId");

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE INDEX "measurements_aspirateurId_timestamp_idx" ON "measurements"("aspirateurId", "timestamp");

-- CreateIndex
CREATE INDEX "measurements_timestamp_idx" ON "measurements"("timestamp");

-- CreateIndex
CREATE INDEX "collectes_aspirateurId_idx" ON "collectes"("aspirateurId");

-- CreateIndex
CREATE INDEX "collectes_agentId_idx" ON "collectes"("agentId");

-- CreateIndex
CREATE INDEX "collectes_missionId_idx" ON "collectes"("missionId");

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_aspirateurId_fkey" FOREIGN KEY ("aspirateurId") REFERENCES "aspirateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_aspirateurId_fkey" FOREIGN KEY ("aspirateurId") REFERENCES "aspirateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collectes" ADD CONSTRAINT "collectes_aspirateurId_fkey" FOREIGN KEY ("aspirateurId") REFERENCES "aspirateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collectes" ADD CONSTRAINT "collectes_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collectes" ADD CONSTRAINT "collectes_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
