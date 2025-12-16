const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed contact requests
  const existingRequests = await prisma.contactRequest.count();
  if (existingRequests > 0) {
    console.log('✓ Contact requests already seeded.');
  } else {
    await prisma.contactRequest.createMany({
      data: [
        {
          email: 'demo@terracontrolgt.com',
          message: 'Estoy interesado en los servicios de TerraControl.',
          source: 'seed'
        },
        {
          email: 'contacto@cliente.com',
          message: 'Por favor compartan más información.',
          source: 'seed'
        }
      ]
    });
    console.log('✓ Contact requests seeded.');
  }

  // Seed users - check for each one individually
  const users = [
    { username: 'GabrielCAdmin', password: 'TerraControl!2026', hasFullAccess: 1 },
    { username: 'JavierMAdmin', password: 'TerraControl!2026', hasFullAccess: 1 },
    { username: 'SebasEDev', password: 'TerraControl!2026', hasFullAccess: 1 }
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { username: user.username }
    });

    if (existing) {
      console.log(`✓ User ${user.username} already exists.`);
    } else {
      await prisma.user.create({
        data: user
      });
      console.log(`✓ User ${user.username} created.`);
    }
  }

  console.log('✓ Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
