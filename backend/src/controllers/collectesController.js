const prisma = require("../prismaClient");

async function getCollectes(req, res) {
  const collectes = await prisma.collecte.findMany({
    orderBy: { collectedAt: "desc" },
    include: {
      aspirateur: true,
      agent: true,
      mission: true,
    },
    take: 200,
  });

  res.json(collectes);
}

async function createCollecte(req, res) {
  const {
    aspirateurId,
    agentId,
    missionId,
    weight,
    latitude,
    longitude,
    collectedAt,
  } = req.body;

  if (!aspirateurId || !agentId || weight == null) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const [aspirateur, agent] = await Promise.all([
    prisma.aspirateur.findUnique({ where: { id: aspirateurId } }),
    prisma.user.findUnique({ where: { id: agentId } }),
  ]);

  if (!aspirateur) {
    return res.status(404).json({ error: "Aspirateur introuvable" });
  }

  if (!agent) {
    return res.status(404).json({ error: "Agent introuvable" });
  }

  const collecte = await prisma.collecte.create({
    data: {
      aspirateurId,
      agentId,
      missionId,
      weight,
      latitude,
      longitude,
      collectedAt,
    },
  });

  res.status(201).json(collecte);
}

module.exports = { getCollectes, createCollecte };
