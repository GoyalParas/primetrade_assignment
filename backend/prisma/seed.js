const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data to ensure clean state
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('🧹 Cleaned up existing database records.');

  // Create hashed passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const userPasswordHash = await bcrypt.hash('User@123', 12);

  // Seed Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@primetrade.ai',
      name: 'Sonika (Admin)',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`👤 Seeded admin user: ${admin.email}`);

  // Seed Regular User
  const user = await prisma.user.create({
    data: {
      email: 'user@primetrade.ai',
      name: 'John Doe',
      password: userPasswordHash,
      role: 'USER',
    },
  });
  console.log(`👤 Seeded regular user: ${user.email}`);

  // Seed Sample Tasks for Regular User
  const userTasks = [
    {
      title: 'Complete primetrade backend assignment',
      description: 'Implement JWT auth, RBAC, Tasks CRUD, and Docker containerization.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2), // 2 days from now
    },
    {
      title: 'Design database schema',
      description: 'Create PostgreSQL schema diagram and Prisma models.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      title: 'Write API documentation',
      description: 'Export Swagger YAML and Postman collections.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 3), // 3 days from now
    },
  ];

  for (const taskData of userTasks) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId: user.id,
      },
    });
    console.log(`📝 Seeded task for user: "${task.title}"`);
  }

  // Seed Sample Tasks for Admin
  const adminTasks = [
    {
      title: 'Review candidate assignments',
      description: 'Go through GitHub links and test the APIs.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 4),
    },
    {
      title: 'Setup production caching',
      description: 'Upgrade the in-memory cache to Redis server.',
      status: 'TODO',
      priority: 'LOW',
    },
  ];

  for (const taskData of adminTasks) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId: admin.id,
      },
    });
    console.log(`📝 Seeded task for admin: "${task.title}"`);
  }

  console.log('✅ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
