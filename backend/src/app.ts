// Render deployment marker: compatibility-api-v1
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRateLimit } from './middleware/rate-limit.js';
import { healthRouter } from './routes/health.routes.js';
import { locationsRouter } from './routes/locations.routes.js';
import { summaryRouter } from './routes/summary.routes.js';
import { observationsRouter } from './routes/observations.routes.js';
import { phenologyRouter } from './routes/phenology.routes.js';
import {
  alertsRouter,
  auditRouter,
  dispatchRouter,
  exportRouter,
  hotspotsRouter,
  telemetryRouter
} from './routes/compatibility.routes.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  const configuredOrigins = env.CORS_ORIGIN
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  const allowedOrigins =
    env.NODE_ENV === 'production'
      ? configuredOrigins
      : [
          ...configuredOrigins,
          'http://localhost:5173'
        ];

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('CORS origin denied'));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept']
    })
  );

  app.use(express.json({ limit: '32kb' }));

  app.use((req, res, next) => {
    req.setTimeout(env.REQUEST_TIMEOUT_MS);
    res.setTimeout(env.REQUEST_TIMEOUT_MS);
    next();
  });

  app.use('/api/v1', apiRateLimit);

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/locations', locationsRouter);
  app.use('/api/v1/summary', summaryRouter);
  app.use('/api/v1/observations', observationsRouter);

  app.use('/api/v1/hotspots', hotspotsRouter);
  app.use('/api/v1/alerts', alertsRouter);
  app.use('/api/v1/phenology', phenologyRouter);
  app.use('/api/v1/telemetry', telemetryRouter);
  app.use('/api/v1/audit', auditRouter);
  app.use('/api/v1/dispatch', dispatchRouter);
  app.use('/api/v1/export', exportRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
