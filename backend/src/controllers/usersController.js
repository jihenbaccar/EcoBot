const bcrypt = require("bcrypt");
const prisma = require("../prismaClient");

async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(users);
}

async function createUser(req, res) {
  const { firstName, lastName, email, password, role, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phone,
    },
  });

  const { password: _, ...userData } = user;
  res.status(201).json(userData);
}

module.exports = { getUsers, createUser };
