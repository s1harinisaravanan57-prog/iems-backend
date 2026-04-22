// src/config/database.js
// Task 3: Setup database connection
// Uses pg (node-postgres) with a connection pool for efficient query handling.
// Supports both Render's DATABASE_URL and individual connection parameters.

const { Pool } = require('pg');

const pool = new Pool({
    // Render provides DATABASE_URL; fall back to individual parameters for local dev
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'iems_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    // Pool settings — tune based on your server capacity
    max: 10,   // max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // For SSL on production (Render uses SSL)
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connectivity on startup and expose pool health
pool.on('connect', () => {
    console.log('[DB] New client connected to PostgreSQL pool');
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Ping the database to confirm the connection is live.
 * Called during server startup (Task 6).
 */
async function testConnection() {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW() AS current_time, version() AS pg_version');
            const { current_time, pg_version } = result.rows[0];
            console.log(`[DB] Connected — server time: ${current_time}`);
            console.log(`[DB] PostgreSQL: ${pg_version.split(',')[0]}`);
            return true;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(`[DB] Connection Error: ${err.message}`);
        console.error(`[DB] Make sure PostgreSQL is running on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        throw err;
    }
}

module.exports = { pool, testConnection };
