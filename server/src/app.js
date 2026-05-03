import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import paperRoutes from './routes/paper.routes.js';
import authRoutes from './routes/auth.routes.js';
import statsRoutes from './routes/stats.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// Trust proxy for Render deployment (required for rate-limit)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter); // Apply rate limiter to all API requests

// Compression & Body Parsing
app.use(compression()); // Compress all routes
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/papers', paperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

// Welcome routes
app.get('/', (req, res) => {
  res.send('<h1>Exams Of DCRUST API is Live!</h1><p>Visit /api/health for status.</p>');
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Exams Of DCRUST API', version: '1.0.0' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PYQ Platform API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;