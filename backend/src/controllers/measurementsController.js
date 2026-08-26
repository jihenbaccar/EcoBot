const prisma = require("../prismaClient");
const { serializeMeasurement } = require("../services/webSocketService");

async function getMeasurements(req, res) {
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 100, 1),
    500,
  );
  const measurements = await prisma.measurement.findMany({
    where: req.query.deviceId ? { deviceId: req.query.deviceId } : undefined,
    orderBy: { timestamp: "desc" },
    take: limit,
  });
  res.json(measurements.map(serializeMeasurement));
}

async function getLatestMeasurement(req, res) {
  const measurement = await prisma.measurement.findFirst({
    where: req.query.deviceId ? { deviceId: req.query.deviceId } : undefined,
    orderBy: { timestamp: "desc" },
  });
  if (!measurement)
    return res.status(404).json({ error: "Aucune mesure disponible" });
  res.json(serializeMeasurement(measurement));
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

  res.status(201).json(serializeMeasurement(measurement));
}

module.exports = { getMeasurements, getLatestMeasurement, createMeasurement };
