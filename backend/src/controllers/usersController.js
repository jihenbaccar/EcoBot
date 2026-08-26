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

  try {
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
  } catch (error) {
    if (error.code === "P2002")
      return res.status(409).json({ error: "Cet email existe déjà" });
    return res
      .status(400)
      .json({ error: "Rôle ou données utilisateur invalides" });
  }
}

async function updateUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const { firstName, lastName, email, role, phone, isActive, password } =
    req.body;
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Identifiant invalide" });
  try {
    const data = { firstName, lastName, email, role, phone, isActive };
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id }, data });
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(409).json({ error: "Cet email existe déjà" });
    res.status(404).json({ error: "Utilisateur introuvable" });
  }
}

async function deleteUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (id === req.user.userId)
    return res
      .status(400)
      .json({ error: "Impossible de supprimer son propre compte" });
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res
      .status(409)
      .json({ error: "Utilisateur utilisé par une mission ou une collecte" });
  }
}

module.exports = { getUsers, createUser, updateUser, deleteUser };
