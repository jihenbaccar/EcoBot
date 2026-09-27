const prisma = require("../prismaClient");

async function getNotifications(req, res) {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: req.user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
}

async function markNotificationsRead(req, res) {
  await prisma.notification.updateMany({
    where: { recipientId: req.user.userId, readAt: null },
    data: { readAt: new Date() },
  });
  res.status(204).end();
}

module.exports = { getNotifications, markNotificationsRead };
