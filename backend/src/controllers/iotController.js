const prisma = require("../prismaClient");

async function createMeasurementFromDevice(req, res) {
  const { deviceReference, weight, battery, latitude, longitude } = req.body;

  if (!deviceReference || weight == null || battery == null) {
    return res
      .status(400)
      .json({ error: "deviceReference, weight et battery sont requis" });
  }

  const aspirateur = await prisma.aspirateur.findUnique({
    where: { reference: deviceReference },
  });

  if (!aspirateur) {
    return res.status(404).json({ error: "Aspirateur introuvable" });
  }

  const measurement = await prisma.measurement.create({
    data: {
      aspirateurId: aspirateur.id,
      weight,
      battery,
      latitude,
      longitude,
    },
  });

  await prisma.aspirateur.update({
    where: { id: aspirateur.id },
    data: {
      currentWeight: weight,
      batteryLevel: battery,
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastSeen: new Date(),
      status: battery > 5 ? "ACTIVE" : "OFFLINE",
    },
  });

  res.status(201).json(measurement);
}

module.exports = { createMeasurementFromDevice };
