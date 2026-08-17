const prisma = require("../prismaClient");

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

  res.json(aspirateurs);
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

  res.json(aspirateur);
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

module.exports = {
  getAspirateurs,
  getAspirateurById,
  createAspirateur,
  updateAspirateur,
};
