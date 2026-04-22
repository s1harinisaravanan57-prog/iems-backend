const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./config/database');

async function migrate() {
    console.log('Env PG user:', process.env.DB_USER);
    const client = await pool.connect();
    try {
        console.log('Starting migration...');
        
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS work_place VARCHAR(50),
            ADD COLUMN IF NOT EXISTS leave_taken INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS leave_allocated INTEGER DEFAULT 5
        `);
        console.log('Columns added.');

        const { rows: users } = await client.query('SELECT id FROM users');
        const zones = ['zoneA', 'zoneB', 'zoneC'];

        for (const user of users) {
             const randomZone = zones[Math.floor(Math.random() * zones.length)];
             const randomAllocated = Math.floor(Math.random() * 3) + 3; // 3 to 5
             const randomTaken = Math.floor(Math.random() * (randomAllocated + 1)); // 0 to allocated
             
             await client.query(
                 'UPDATE users SET work_place = $1, leave_taken = $2, leave_allocated = $3 WHERE id = $4',
                 [randomZone, randomTaken, randomAllocated, user.id]
             );
        }
        console.log('Dummy data assigned to existing users.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
