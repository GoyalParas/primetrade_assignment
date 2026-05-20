const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log prisma queries in development mode
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Prisma Query: ${e.query} - Parameters: ${e.params} - Duration: ${e.duration}ms`);
  });
}

// Graceful shutdown database connection
const handleShutdown = async () => {
  logger.info('Disconnecting Prisma Client...');
  await prisma.$disconnect();
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

module.exports = prisma;
