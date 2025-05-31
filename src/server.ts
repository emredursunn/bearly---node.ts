import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import sequelize from './config/database';
import logger, { logStream } from './utils/logger';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import storyRoutes from './routes/storyRoutes';
import wordRoutes from './routes/wordRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev'));

// Add request ID to logs for tracking
app.use((req: Request, _res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.defaultMeta = { ...logger.defaultMeta, requestId };
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/words', wordRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Basic route for API status
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Language Story App API running',
  });
});

// Set port
const PORT = process.env.PORT || 3000;

// Database connection and server startup
const startServer = async () => {
  try {
    // Start the server regardless of database connection
    const server = app.listen(PORT, () => {
      logger.info(`⚡️ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`👉 API available at http://localhost:${PORT}`);
    });

    // Keep the server running by handling process signals
    process.on('SIGINT', () => {
      logger.info('\n🔴 Gracefully shutting down server...');
      server.close(() => {
        logger.info('🔴 Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', { error: error.message, stack: error.stack });
      // Keep server running despite uncaught exceptions
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Promise Rejection:', { reason, promise });
    });

    try {
      // Attempt to connect to the database
      await sequelize.authenticate();
      logger.info('✅ Database connection established successfully.');

      // Sync database models
      await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
      logger.info('✅ Database models synced successfully.');
    } catch (dbError: any) {
      logger.error('⚠️ Database connection failed:', { error: dbError.message, stack: dbError.stack });
      logger.warn('\n📋 Database Setup Instructions:');
      logger.warn('1. Make sure PostgreSQL is installed and running');
      logger.warn('2. Create a database named "language_story_app"');
      logger.warn('   $ createdb language_story_app');
      logger.warn('3. If you need to use different credentials, update the .env file');
      logger.warn('\n👉 The server is running but API calls requiring database access will fail');
    }

    // This log indicates the server is fully initialized and will remain running
    logger.info('\n🟢 Server initialization complete - Press Ctrl+C to stop');
  } catch (error: any) {
    logger.error('❌ Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1); // Exit with failure
  }
};

startServer();
