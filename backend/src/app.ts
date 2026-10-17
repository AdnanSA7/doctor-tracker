import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRoutes from './modules/auth/auth.routes.js';
import doctorRoutes from './modules/doctors/doctors.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import userRoutes from './modules/users/users.routes.js';
import permissionsRoutes from './modules/permissions/permissions.routes.js';
import { errorHandler } from './middleware/error.js';
import { ensureMongoUri } from './config/db.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        if (origin === frontendUrl || origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        callback(null, true); // Fallback allow or strict check
      },
      credentials: true,
    })
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  if (process.env.NODE_ENV !== 'test') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api/', limiter);
  }

  const rawMongoUri = process.env.MONGODB_URI || 'mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker';
  const mongoUri = ensureMongoUri(rawMongoUri);
  
  const rawSessionSecret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!rawSessionSecret || rawSessionSecret.trim() === '') {
      // Log a critical warning but don't throw — throwing crashes the entire serverless function
      // and returns FUNCTION_INVOCATION_FAILED instead of a useful error.
      // ACTION REQUIRED: Set SESSION_SECRET in your Vercel environment variables.
      console.error('[FATAL CONFIG] SESSION_SECRET is not set in production. Sessions will be insecure. Set this in Vercel environment variables immediately.');
    }
  }
  const sessionSecret = rawSessionSecret && rawSessionSecret.trim() !== '' ? rawSessionSecret : 'fallback-dev-secret-set-SESSION_SECRET-in-vercel';

  const sessionConfig: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  };

  if (process.env.NODE_ENV !== 'test') {
    sessionConfig.store = MongoStore.create({
      mongoUrl: mongoUri,
      touchAfter: 24 * 3600,
    });
  }

  app.use(session(sessionConfig));

  app.get('/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/doctors', doctorRoutes);
  app.use('/api/v1/patients', patientRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/permissions', permissionsRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  app.use(errorHandler);

  return app;
}
