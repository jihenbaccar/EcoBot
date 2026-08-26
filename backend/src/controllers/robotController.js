const { publishCommand, allowedDeviceId } = require("../services/mqttService");
const prisma = require("../prismaClient");
const { serializeMeasurement } = require("../services/webSocketService");

function checkDevice(req, res) {
  if (req.params.deviceId !== allowedDeviceId) {
    res.status(404).json({ error: "Robot introuvable" });
    return false;
  }
  return true;
}

function requestStatus(req, res) {
  if (!checkDevice(req, res)) return;
  try {
    const payload = JSON.stringify({ action: "STATUS" });
    publishCommand(req.params.deviceId, payload);
    res.json({ success: true, command: "STATUS", payload });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
}

async function getRobot(req, res) {
  if (!checkDevice(req, res)) return;
  const measurement = await prisma.measurement.findFirst({
    where: { deviceId: req.params.deviceId },
    orderBy: { timestamp: "desc" },
  });
  if (!measurement)
    return res.status(404).json({ error: "Aucune mesure disponible" });
  res.json(serializeMeasurement(measurement));
}

function setSpeed(req, res) {
  if (!checkDevice(req, res)) return;
  return res.status(400).json({
    error: "La vitesse est fixée par MOTOR_SPEED dans le firmware ESP32",
  });
}

module.exports = {
  getRobot,
  requestStatus,
  setSpeed,
};
