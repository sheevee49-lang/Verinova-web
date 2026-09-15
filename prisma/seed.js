// Seeds the default interest set. Run with: npx prisma db seed
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_INTERESTS = [
  'Agriculture', 'Technology', 'Entrepreneurship', 'Education', 'Health',
  'Finance', 'Arts & Culture', 'Climate & Environment', 'Youth Development',
  'Governance', 'Manufacturing', 'Trade & Commerce',
];

async function main() {
  for (const name of DEFAULT_INTERESTS) {
    await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${DEFAULT_INTERESTS.length} interests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
