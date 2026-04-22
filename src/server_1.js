// src/server.js
// Task 1: Node.js project entry point
// Task 6: Start server
// Loads env → tests DB → initialises schema → binds HTTP port.

require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');
const { initSchema: initMachines } = require('./modules/machines/machine.model');
const { initSchema: initEquipment } = require('./modules/equipment/equipment.model');
const { initSchema: initMaint } = require('./modules/maintenance/maintenance.model');

const PORT = parseInt(process.env.PORT, 10) || 3000;

async function bootstrap() {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   IEMS — Industrial Equipment Mgmt     ║');
    console.log('║   Backend API  •  Phase 1              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');

    // 1. Verify database connectivity before accepting traffic
    console.log('[Boot] Connecting to database...');
    await testConnection();

    // 2. Ensure schema is up to date (idempotent — safe to run every startup)
    console.log('[Boot] Initialising schema...');
    await initMachines();
    await initEquipment();
    await initMaint();

    // 3. Bind the HTTP server
    app.listen(PORT, () => {
        console.log('');
        console.log(`[Boot] ✓ Server running on http://localhost:${PORT}`);
        console.log(`[Boot] ✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('');
        console.log('  Available endpoints:');
        console.log(`  POST   /api/v1/auth/login`);
        console.log(`  GET    /api/v1/auth/me`);
        console.log(`  GET    /api/v1/equipment`);
        console.log(`  POST   /api/v1/equipment`);
        console.log(`  GET    /api/v1/equipment/:id`);
        console.log(`  PUT    /api/v1/equipment/:id`);
        console.log(`  DELETE /api/v1/equipment/:id`);
        console.log(`  GET    /api/v1/maintenance`);
        console.log(`  POST   /api/v1/maintenance`);
        console.log(`  GET    /api/v1/maintenance/:id`);
        console.log(`  PUT    /api/v1/maintenance/:id`);
        console.log(`  GET    /api/v1/health`);
        console.log('');
    });
}

// Graceful shutdown — release DB pool on SIGTERM (Docker, Kubernetes, etc.)
process.on('SIGTERM', () => {
    const { pool } = require('./config/database');
    console.log('\n[Shutdown] SIGTERM received — closing DB pool...');
    pool.end(() => {
        console.log('[Shutdown] Pool closed. Goodbye.');
        process.exit(0);
    });
});

bootstrap().catch((err) => {
    console.error('[Boot] FATAL — failed to start:', err.message);
    process.exit(1);
});
