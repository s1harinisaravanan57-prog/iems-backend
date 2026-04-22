// src/app.js
// Task 2: Setup Express server
// Configures middleware stack and mounts all routers.
// Kept separate from server.js so the app can be imported in tests without binding a port.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const authMiddleware = require('./middlewares/auth.middleware');
const corsOptions = require('./config/cors');

const healthcheck = require('./shared/healthcheck');
const healthRouter = require('./modules/health/health.routes');
const machineRouter = require('./modules/machines/machine.routes');
const authRouter = require('./modules/auth/auth.routes');
const equipmentRouter = require('./modules/equipment/equipment.routes');
const maintenanceRouter = require('./modules/maintenance/maintenance.routes');
const usersRouter = require('./modules/users/users.routes');

const app = express();

// ------------------------------------------------------------------
// Security & utility middleware
// ------------------------------------------------------------------
app.use(helmet({
    contentSecurityPolicy: false, // disable CSP so inline scripts and external styles work for our simple static frontend
}));
app.use(cors(corsOptions));         // Enable CORS with production-aware configuration
app.use(morgan('dev'));  // HTTP request logger

// ------------------------------------------------------------------
// Body parsing
// ------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/machines', machineRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/equipment', equipmentRouter);
app.use('/api/v1/maintenance', maintenanceRouter);
app.use('/api/v1/users', usersRouter);

// ------------------------------------------------------------------
// Static Frontend Proxy
// ------------------------------------------------------------------
app.use(express.static(path.join(__dirname, '../files')));

// Serve index.html on root explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../files/index.html'));
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ------------------------------------------------------------------
// Global error handler
// ------------------------------------------------------------------
app.use((err, req, res, _next) => {
    console.error('[Error]', err.message);
    // Don't leak stack traces in production
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(isDev && { stack: err.stack }),
    });
});

module.exports = app;
