import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { env } from '../src/config/env.js';
import routes from '../src/routes/index.js';
import { errorHandler, notFound } from '../src/middleware/error.middleware.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || env.FRONTEND_URL,
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

