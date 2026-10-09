/**
 * ══════════════════════════════════════════════════════════════
 *  ParkSmart — Parking Slot Reservation System
 *  Main Server Entry Point
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO3  — Design/Development of the REST API server
 *    PO5  — Modern Tool Usage (Express, Mongoose, JWT)
 *    PSO1 — Full-stack software design & development
 *    SDG 11 — Sustainable Cities: smart parking reduces
 *             traffic congestion and urban pollution
 *    SDG 13 — Climate Action: analytics-driven parking
 *             optimization lowers vehicle idle emissions
 *
 * ══════════════════════════════════════════════════════════════
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

// ─── Load env vars ───
require('dotenv').config();

// ─── Import routes ───
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const parkingRoutes = require('./routes/parking.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

// ─── Import middleware ───
const errorHandler = require('./middleware/errorHandler');

// ─── Import cron jobs ───
const { initCronJobs } = require('./services/cron.service');

// ─── Create Express app ───
const app = express();

// ═══════════════════════════════════════════
//  SECURITY MIDDLEWARE  (PO6 — Engineer & Society)
// ═══════════════════════════════════════════

// Set security HTTP headers
app.use(helmet());

// Enable CORS for the React client
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parsing (for refresh tokens)
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// ═══════════════════════════════════════════
//  STATIC FILES
// ═══════════════════════════════════════════
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════
//  API ROUTES  (PO3 — Design/Development)
// ═══════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ParkSmart API is running 🚗',
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════
//  ERROR HANDLING
// ═══════════════════════════════════════════
app.use(errorHandler);

// ═══════════════════════════════════════════
//  DATABASE & SERVER START
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parking_system';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 ParkSmart API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      // ─ Start background cron jobs ─
      initCronJobs();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
