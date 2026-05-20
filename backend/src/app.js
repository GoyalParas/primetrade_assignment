const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRouter = require('./modules/auth/auth.routes');
const tasksRouter = require('./modules/tasks/tasks.routes');
const adminUsersRouter = require('./modules/users/users.routes');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS with support for cookie cookies credentials exchange
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Limit requests to all APIs
app.use(generalLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Parse cookie headers
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Swagger API Documentation Route
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info('📖 Swagger API Documentation initialized at /api-docs');
} catch (error) {
  logger.warn('⚠️ Failed to load Swagger documentation file. Swagger UI will be unavailable.', { error: error.message });
}

// Health check endpoint
app.get('/api/v1/health', async (req, res) => {
  try {
    // Basic database connection check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Service is healthy',
      data: {
        timestamp: new Date(),
        uptime: process.uptime(),
        database: 'connected',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Service is unhealthy',
      data: {
        timestamp: new Date(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
});

// Register Module Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/admin/users', adminUsersRouter);

// Fallback for undefined routes
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.statusCode = 404;
  next(err);
});

// Global error handler middleware
app.use(errorHandler);

module.exports = app;
