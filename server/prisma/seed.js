const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.contactRequest.count();

  if (existing > 0) {
    console.log('Contact requests table already seeded.');
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

    console.log('Contact requests seed data inserted.');
  }

  await prisma.user.createMany({
    data: [
      {
        username: 'gabrilCAdmin',
        password: 'TerraControl!2026',
        hasFullAccess: 1
      },
      {
        username: 'JavierMAmin',
        password: 'TerraControl!2026',
        hasFullAccess: 1
      },
      {
        username: 'SebasEDev',
        password: 'TerraControl!2026',
        hasFullAccess: 1
      }
    ],
    skipDuplicates: true
  });

  console.log('User seed data inserted.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
