const prisma = require("../prismaClient");

async function getMissions(req, res) {
  const missions = await prisma.mission.findMany({
    include: {
      agent: true,
      aspirateur: true,
      collectes: true,
    },
  });
  res.json(missions);
}

async function getMissionById(req, res) {
  const missionId = parseInt(req.params.id, 10);

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      agent: true,
      aspirateur: true,
      collectes: true,
    },
  });

  if (!mission) {
    return res.status(404).json({ error: "Mission introuvable" });
  }

  res.json(mission);
}

async function createMission(req, res) {
  const {
    agentId,
    aspirateurId,
    locationName,
    address,
    latitude,
    longitude,
    status,
    startTime,
    endTime,
    notes,
  } = req.body;

  if (
    !agentId ||
    !aspirateurId ||
    !locationName ||
    latitude == null ||
    longitude == null
  ) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const mission = await prisma.mission.create({
    data: {
      agentId,
      aspirateurId,
      locationName,
      address,
      latitude,
      longitude,
      status,
      startTime,
      endTime,
      notes,
    },
  });

  res.status(201).json(mission);
}

async function updateMission(req, res) {
  const missionId = parseInt(req.params.id, 10);
  const {
    agentId,
    aspirateurId,
    locationName,
    address,
    latitude,
    longitude,
    status,
    startTime,
    endTime,
    notes,
  } = req.body;

  try {
    const mission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        agentId,
        aspirateurId,
        locationName,
        address,
        latitude,
        longitude,
        status,
        startTime,
        endTime,
        notes,
      },
    });
    res.json(mission);
  } catch (error) {
    res.status(404).json({ error: "Mission introuvable" });
  }
}

module.exports = {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
};
