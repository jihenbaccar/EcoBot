const prisma = require("../prismaClient");

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  return date;
}

function startOfMonth() {
  const date = startOfToday();
  date.setDate(1);
  return date;
}

function startOfYear() {
  const date = startOfToday();
  date.setMonth(0, 1);
  return date;
}

async function getStatistics(req, res) {
  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.collectedAt = {};
    if (startDate) {
      filter.collectedAt.gte = new Date(startDate);
    }
    if (endDate) {
      filter.collectedAt.lte = new Date(endDate);
    }
  }

  const [todayResult, weekResult, monthResult, yearResult] = await Promise.all([
    prisma.collecte.aggregate({
      _sum: { weight: true },
      where: { collectedAt: { gte: startOfToday() } },
    }),
    prisma.collecte.aggregate({
      _sum: { weight: true },
      where: { collectedAt: { gte: startOfWeek() } },
    }),
    prisma.collecte.aggregate({
      _sum: { weight: true },
      where: { collectedAt: { gte: startOfMonth() } },
    }),
    prisma.collecte.aggregate({
      _sum: { weight: true },
      where: { collectedAt: { gte: startOfYear() } },
    }),
  ]);

  const [activeAspirateurs, offlineAspirateurs, enCoursMissions, activeAgents] =
    await Promise.all([
      prisma.aspirateur.count({ where: { status: "ACTIVE" } }),
      prisma.aspirateur.count({ where: { status: "OFFLINE" } }),
      prisma.mission.count({ where: { status: "EN_COURS" } }),
      prisma.user.count({ where: { role: "AGENT", isActive: true } }),
    ]);

  const customResult = await prisma.collecte.aggregate({
    _sum: { weight: true },
    where: filter,
  });

  res.json({
    todayWeight: todayResult._sum.weight ?? 0,
    weekWeight: weekResult._sum.weight ?? 0,
    monthWeight: monthResult._sum.weight ?? 0,
    yearWeight: yearResult._sum.weight ?? 0,
    activeAspirateurs,
    offlineAspirateurs,
    enCoursMissions,
    activeAgents,
    customPeriodWeight: customResult._sum.weight ?? 0,
  });
}

module.exports = { getStatistics };
