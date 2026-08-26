const prisma = require("../prismaClient");
const { broadcastMeasurement } = require("./webSocketService");

const numericFields = [
  "weight",
  "weightKg",
  "batteryVoltage",
  "batteryPercentage",
  "satellites",
  "motorSpeed",
  "wifiRssi",
  "uptime",
];

function normalizeMeasurement(data) {
  if (!data || data.poids == null) return data;

  const weight = Number(data.poids);
  const batteryVoltage = Number(data.batterie ?? 0);
  const latitude = Number(data.latitude ?? 0);
  const longitude = Number(data.longitude ?? 0);
  const hasGpsFix =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    (latitude !== 0 || longitude !== 0);
  const motorRunning = String(data.moteur || "OFF").toUpperCase() === "ON";

  return {
    ...data,
    deviceId: data.deviceId,
    weight,
    weightKg: weight / 1000,
    battery: Number(data.batteryPercentage ?? 0),
    batteryVoltage,
    batteryPercentage: Number(data.batteryPercentage ?? 0),
    latitude: hasGpsFix ? latitude : null,
    longitude: hasGpsFix ? longitude : null,
    gpsFix: hasGpsFix,
    satellites: Number(data.satellites ?? 0),
    binStatus: data.etatBac || "OK",
    motorRunning,
    motorSpeed: Number(data.motorSpeed ?? 0),
    wifiRssi: Number(data.wifiRssi ?? 0),
    uptime: Number(data.uptime ?? 0),
  };
}

function validateMeasurement(data) {
  if (!data || typeof data.deviceId !== "string" || !data.deviceId.trim()) {
    throw new Error("deviceId est requis");
  }

  for (const field of numericFields) {
    if (
      data[field] == null ||
      typeof data[field] !== "number" ||
      !Number.isFinite(data[field])
    ) {
      throw new Error(`${field} doit être numérique`);
    }
  }

  for (const field of ["latitude", "longitude"]) {
    if (
      data[field] != null &&
      (typeof data[field] !== "number" || !Number.isFinite(data[field]))
    ) {
      throw new Error(`${field} doit être numérique lorsqu'il est fourni`);
    }
  }

  if (
    typeof data.gpsFix !== "boolean" ||
    typeof data.motorRunning !== "boolean"
  ) {
    throw new Error("gpsFix et motorRunning doivent être booléens");
  }
}

function normalizeGps(value) {
  return value >= -90 && value <= 90 ? value : null;
}

async function saveMeasurement(data) {
  const normalizedData = normalizeMeasurement(data);
  validateMeasurement(normalizedData);
  const latitude = normalizedData.gpsFix
    ? normalizeGps(normalizedData.latitude)
    : null;
  const longitude =
    normalizedData.gpsFix &&
    normalizedData.longitude >= -180 &&
    normalizedData.longitude <= 180
      ? normalizedData.longitude
      : null;
  const gpsFix =
    latitude !== null && longitude !== null && normalizedData.gpsFix;

  const aspirateur = await prisma.aspirateur.upsert({
    where: { reference: normalizedData.deviceId },
    update: {
      currentWeight: normalizedData.weightKg,
      batteryLevel: normalizedData.batteryPercentage,
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastSeen: new Date(),
      status: "ACTIVE",
    },
    create: {
      reference: normalizedData.deviceId,
      status: "ACTIVE",
      currentWeight: normalizedData.weightKg,
      batteryLevel: normalizedData.batteryPercentage,
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastSeen: new Date(),
    },
  });

  const measurement = await prisma.measurement.create({
    data: {
      deviceId: normalizedData.deviceId,
      aspirateurId: aspirateur.id,
      weight: normalizedData.weight,
      weightKg: normalizedData.weightKg,
      battery: normalizedData.battery,
      batteryVoltage: normalizedData.batteryVoltage,
      batteryPercentage: normalizedData.batteryPercentage,
      latitude,
      longitude,
      gpsFix,
      satellites: Math.trunc(normalizedData.satellites),
      binStatus: normalizedData.binStatus,
      motorRunning: normalizedData.motorRunning,
      motorSpeed: Math.trunc(normalizedData.motorSpeed),
      wifiRssi: Math.trunc(normalizedData.wifiRssi),
      uptime: Math.trunc(normalizedData.uptime),
    },
  });

  broadcastMeasurement(measurement);
  return measurement;
}

module.exports = { saveMeasurement, validateMeasurement, normalizeMeasurement };
