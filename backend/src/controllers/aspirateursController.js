const prisma = require("../prismaClient");
const { serializeMeasurement } = require("../services/webSocketService");

async function getAspirateurs(req, res) {
  const aspirateurs = await prisma.aspirateur.findMany({
    include: {
      measurements: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
      missions: true,
      collectes: true,
    },
  });

  res.json(aspirateurs.map(serializeMeasurement));
}

async function getAspirateurById(req, res) {
  const aspirateurId = parseInt(req.params.id, 10);

  const aspirateur = await prisma.aspirateur.findUnique({
    where: { id: aspirateurId },
    include: {
      measurements: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
      missions: true,
      collectes: true,
    },
  });

  if (!aspirateur) {
    return res.status(404).json({ error: "Aspirateur introuvable" });
  }

  res.json(serializeMeasurement(aspirateur));
}

async function createAspirateur(req, res) {
  const {
    reference,
    status,
    currentWeight,
    batteryLevel,
    currentLatitude,
    currentLongitude,
  } = req.body;

  if (!reference) {
    return res
      .status(400)
      .json({ error: "La référence de l'aspirateur est requise" });
  }

  try {
    const aspirateur = await prisma.aspirateur.create({
      data: {
        reference,
        status,
        currentWeight: currentWeight ?? 0,
        batteryLevel: batteryLevel ?? 100,
        currentLatitude,
        currentLongitude,
      },
    });
    res.status(201).json(aspirateur);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(409).json({ error: "Cette référence existe déjà" });
    res.status(400).json({ error: "Données aspirateur invalides" });
  }
}

async function updateAspirateur(req, res) {
  const aspirateurId = parseInt(req.params.id, 10);
  const {
    reference,
    status,
    currentWeight,
    batteryLevel,
    currentLatitude,
    currentLongitude,
  } = req.body;

  try {
    const aspirateur = await prisma.aspirateur.update({
      where: { id: aspirateurId },
      data: {
        reference,
        status,
        currentWeight,
        batteryLevel,
        currentLatitude,
        currentLongitude,
      },
    });
    res.json(aspirateur);
  } catch (error) {
    res.status(404).json({ error: "Aspirateur introuvable" });
  }
}

async function deleteAspirateur(req, res) {
  const aspirateurId = Number.parseInt(req.params.id, 10);
  try {
    await prisma.aspirateur.delete({ where: { id: aspirateurId } });
    res.status(204).end();
  } catch (error) {
    res
      .status(409)
      .json({ error: "Aspirateur utilisé par une mission ou une collecte" });
  }
}

module.exports = {
  getAspirateurs,
  getAspirateurById,
  createAspirateur,
  updateAspirateur,
  deleteAspirateur,
};
