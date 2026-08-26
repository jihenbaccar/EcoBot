const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

async function login(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "Compte désactivé" });
  }

  if (role && role !== user.role) {
    return res
      .status(403)
      .json({ error: "Ce compte n'est pas autorisé pour ce rôle" });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  const { password: _, ...userData } = user;

  return res.json({ token, user: userData });
}

module.exports = { login };
