const prisma = require("../prismaClient");
const { broadcastNotification } = require("../services/webSocketService");

async function getMissions(req, res) {
  const missions = await prisma.mission.findMany({
    include: {
      agent: true,
      aspirateur: true,
      collectes: true,
      photos: { orderBy: { uploadedAt: "desc" } },
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
      photos: { orderBy: { uploadedAt: "desc" } },
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

  if (!agentId || !aspirateurId || !locationName) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const mission = await prisma.mission.create({
    data: {
      agentId,
      aspirateurId,
      locationName,
      address,
      latitude: latitude === "" || latitude == null ? null : Number(latitude),
      longitude:
        longitude === "" || longitude == null ? null : Number(longitude),
      status,
      startTime: startTime || (status === "EN_COURS" ? new Date() : null),
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
    const existingMission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: { status: true, startTime: true },
    });
    if (!existingMission) {
      return res.status(404).json({ error: "Mission introuvable" });
    }
    const effectiveStartTime =
      startTime ||
      (status === "EN_COURS" && existingMission.status !== "EN_COURS"
        ? new Date()
        : existingMission.startTime);
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
        startTime: effectiveStartTime,
        endTime,
        notes,
      },
    });
    res.json(mission);
  } catch (error) {
    res.status(404).json({ error: "Mission introuvable" });
  }
}

async function deleteMission(req, res) {
  const missionId = Number.parseInt(req.params.id, 10);
  try {
    await prisma.mission.delete({ where: { id: missionId } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: "Mission introuvable" });
  }
}

async function completeMission(req, res) {
  const missionId = Number.parseInt(req.params.id, 10);
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return res.status(404).json({ error: "Mission introuvable" });
  if (req.user.role === "AGENT" && mission.agentId !== req.user.userId) {
    return res
      .status(403)
      .json({ error: "Cette mission ne vous est pas attribuée" });
  }
  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: { status: "TERMINEE", endTime: new Date() },
  });
  const agent = await prisma.user.findUnique({
    where: { id: mission.agentId },
    select: { firstName: true, lastName: true },
  });
  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISEUR", isActive: true },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: supervisors.map((supervisor) => ({
      recipientId: supervisor.id,
      type: "MISSION_TERMINEE",
      message: `${agent?.firstName || "L'agent"} ${agent?.lastName || ""} a terminé la mission « ${updatedMission.locationName} »`,
      missionId: updatedMission.id,
    })),
  });
  broadcastNotification({
    id: `mission-completed-${updatedMission.id}-${Date.now()}`,
    text: `${agent?.firstName || "L'agent"} ${agent?.lastName || ""} a terminé la mission « ${updatedMission.locationName} »`,
    time: new Date().toLocaleString("fr-FR"),
  });
  res.json(updatedMission);
}

async function uploadMissionPhoto(req, res) {
  const missionId = Number.parseInt(req.params.id, 10);
  const { dataUrl } = req.body;
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return res.status(404).json({ error: "Mission introuvable" });
  if (req.user.role === "AGENT" && mission.agentId !== req.user.userId) {
    return res
      .status(403)
      .json({ error: "Cette mission ne vous est pas attribuée" });
  }
  if (
    typeof dataUrl !== "string" ||
    !/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl) ||
    dataUrl.length > 7_000_000
  ) {
    return res
      .status(400)
      .json({ error: "Photo invalide ou trop volumineuse" });
  }
  const photo = await prisma.missionPhoto.create({
    data: { missionId, dataUrl },
  });
  res.status(201).json(photo);
}

async function reviewMission(req, res) {
  const missionId = Number.parseInt(req.params.id, 10);
  const { approval, reviewComment } = req.body;
  if (!["VALIDEE", "INVALIDE"].includes(approval)) {
    return res.status(400).json({ error: "Décision invalide" });
  }
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return res.status(404).json({ error: "Mission introuvable" });
  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: {
      approval,
      reviewComment: reviewComment?.trim() || null,
      reviewedAt: new Date(),
      status: approval === "INVALIDE" ? "EN_COURS" : "TERMINEE",
    },
    include: { photos: true },
  });
  res.json(updatedMission);
}

async function deleteMissionPhoto(req, res) {
  const photoId = Number.parseInt(req.params.photoId, 10);
  const photo = await prisma.missionPhoto.findUnique({
    where: { id: photoId },
    include: { mission: true },
  });
  if (!photo) return res.status(404).json({ error: "Photo introuvable" });
  if (req.user.role === "AGENT" && photo.mission.agentId !== req.user.userId) {
    return res
      .status(403)
      .json({ error: "Cette mission ne vous est pas attribuée" });
  }
  await prisma.missionPhoto.delete({ where: { id: photoId } });
  res.status(204).end();
}

async function updateMissionStatus(req, res) {
  const missionId = Number.parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!["EN_COURS", "TERMINEE", "ANNULEE"].includes(status)) {
    return res.status(400).json({ error: "Statut de mission invalide" });
  }
  if (req.user.role === "AGENT" && status === "ANNULEE") {
    return res
      .status(403)
      .json({ error: "Un agent ne peut pas annuler une mission" });
  }
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return res.status(404).json({ error: "Mission introuvable" });
  if (req.user.role === "AGENT" && mission.agentId !== req.user.userId) {
    return res
      .status(403)
      .json({ error: "Cette mission ne vous est pas attribuée" });
  }
  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: {
      status,
      startTime:
        status === "EN_COURS" && mission.status !== "EN_COURS"
          ? new Date()
          : mission.startTime,
      endTime: status === "TERMINEE" ? new Date() : null,
    },
  });
  if (status === "TERMINEE") {
    const agent = await prisma.user.findUnique({
      where: { id: mission.agentId },
      select: { firstName: true, lastName: true },
    });
    broadcastNotification({
      id: `mission-completed-${updatedMission.id}-${Date.now()}`,
      text: `${agent?.firstName || "L'agent"} ${agent?.lastName || ""} a terminé la mission « ${updatedMission.locationName} »`,
      time: new Date().toLocaleString("fr-FR"),
    });
  }
  res.json(updatedMission);
}

module.exports = {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  completeMission,
  updateMissionStatus,
  uploadMissionPhoto,
  reviewMission,
  deleteMissionPhoto,
  deleteMission,
};
