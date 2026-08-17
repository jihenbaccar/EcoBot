const bcrypt = require('bcrypt');
require('dotenv').config();
const prisma = require('../src/prismaClient');

async function main() {
  const email = 'admin@local';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Superviseur déjà présent:', email);
    return;
  }

  const password = 'Admin123!';
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Local',
      email,
      password: hashed,
      role: 'SUPERVISEUR',
      phone: null,
    },
  });

  console.log('Superviseur créé:', { id: user.id, email: user.email, password });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
