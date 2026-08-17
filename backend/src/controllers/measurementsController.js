const prisma = require("../prismaClient");

async function getMeasurements(req, res) {
  const measurements = await prisma.measurement.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
  res.json(measurements);
}

async function createMeasurement(req, res) {
  const { aspirateurId, weight, battery, latitude, longitude, timestamp } =
    req.body;

  if (!aspirateurId || weight == null || battery == null) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const aspirateur = await prisma.aspirateur.findUnique({
    where: { id: aspirateurId },
  });
  if (!aspirateur) {
    return res.status(404).json({ error: "Aspirateur introuvable" });
  }

  const measurement = await prisma.measurement.create({
    data: {
      aspirateurId,
      weight,
      battery,
      latitude,
      longitude,
      timestamp,
    },
  });

  await prisma.aspirateur.update({
    where: { id: aspirateurId },
    data: {
      currentWeight: weight,
      batteryLevel: battery,
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastSeen: new Date(),
      status: battery > 5 ? aspirateur.status : "OFFLINE",
    },
  });

  res.status(201).json(measurement);
}

module.exports = { getMeasurements, createMeasurement };
