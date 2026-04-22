// src/config/healthcheck.js
// Task 5: Health check API
// GET /api/v1/health  — returns live status of the server and its dependencies.
// Used by load balancers, monitoring tools (UptimeRobot, Datadog, etc.), and CI pipelines.

const router = require('express').Router();
const { pool } = require('../config/database');
const { initSchema } = require('../modules/machines/machine.repository');
router.get('/', async (req, res) => {
    const startTime = Date.now();
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime_s: Math.floor(process.uptime()),
        service: 'iems-backend',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {},
    };

    // --- Database ping ---
    try {
        await pool.query('SELECT 1');
        health.checks.database = { status: 'ok', latency_ms: Date.now() - startTime };
    } catch (err) {
        health.checks.database = { status: 'error', message: err.message };
        health.status = 'degraded';
    }

    // --- Machine summary (shows model layer is wired up) ---
    try {
        const summary = await model.getStatusSummary();
        health.checks.machines = { status: 'ok', summary };
    } catch (err) {
        health.checks.machines = { status: 'error', message: err.message };
    }

    // --- Memory usage ---
    const mem = process.memoryUsage();
    health.checks.memory = {
        status: 'ok',
        heap_used_mb: (mem.heapUsed / 1024 / 1024).toFixed(1),
        heap_total_mb: (mem.heapTotal / 1024 / 1024).toFixed(1),
        rss_mb: (mem.rss / 1024 / 1024).toFixed(1),
    };

    health.response_ms = Date.now() - startTime;

    const httpStatus = health.status === 'ok' ? 200 : 503;
    res.status(httpStatus).json(health);
});

module.exports = router;
