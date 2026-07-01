import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route imports
import invoiceRoutes from './routes/invoiceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// --- App Initialization ---
const app = express();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Connect to MongoDB ---
connectDB();

// --- Middleware ---

// CORS – allow the Vite dev-server on port 5173 and production URL
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Parse incoming JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/invoices', invoiceRoutes);
app.use('/api', uploadRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Global Error Handler ---
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ message: 'Internal server error' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
