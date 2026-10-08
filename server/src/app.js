import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import config from './config/env.js';
import logger from './utils/logger.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimit.js';

// Routes
import calendarRoutes from './routes/calendar.js';
import plansRoutes from './routes/plans.js';
import scanRoutes from './routes/scan.js';
import restaurantsRoutes from './routes/restaurants.js';
import usersRoutes from './routes/users.js';
import mapsRoutes from './routes/maps.js';
import chatRoutes from './routes/chat.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));

// Logging
app.use(pinoHttp({ logger }));

// Request ID
app.use(requestId);

// Body parsing
app.use(express.json({ limit: '100kb' }));

// Rate limiting
app.use(rateLimiter);

// API routes with auth
app.use('/api', auth);

// API endpoints
app.use('/api/calendar', calendarRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/chat', chatRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `${req.method} ${req.path} not found`,
    },
  });
});

// Error handler (last)
app.use(errorHandler);

export default app;
