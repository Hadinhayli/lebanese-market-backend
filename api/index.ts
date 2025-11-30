import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { env } from '../src/config/env.js';
import routes from '../src/routes/index.js';
import { errorHandler, notFound } from '../src/middleware/error.middleware.js';

const app = express();

// Middleware - CORS configuration
// Allow both localhost (for development) and production URL
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL || env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export as Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

