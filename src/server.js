// src/server.js
// Task 1: Node.js project entry point
// Task 6: Start server
// Loads env → tests DB → initialises schema → binds HTTP port.

require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');
const { initSchema: initEquipmentSchema } = require('./modules/machines/machine.repository');
const { initSchema: initMaintenanceSchema } = require('./modules/maintenance/maintenance.model');

const PORT = process.env.PORT || 3000;


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
    await initEquipmentSchema();
    await initMaintenanceSchema();

    // 3. Bind the HTTP server
    app.listen(PORT, () => {
        console.log('');
        console.log(`[Boot] ✓ Server running on http://localhost:${PORT}`);
        console.log(`[Boot] ✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('');
        console.log('  Available endpoints:');
        console.log(`  GET  http://localhost:${PORT}/api/v1/health`);
        console.log(`  GET  http://localhost:${PORT}/api/v1/machines`);
        console.log(`  POST http://localhost:${PORT}/api/v1/machines`);
        console.log(`  GET  http://localhost:${PORT}/api/v1/machines/:id`);
        console.log(`  PATCH http://localhost:${PORT}/api/v1/machines/:id`);
        console.log(`  DELETE http://localhost:${PORT}/api/v1/machines/:id`);
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
