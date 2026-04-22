// src/modules/machines/machine.model.js
// Task 4: Equipment model
// Defines the machines table schema and exposes repository-style query methods.

const { pool } = require('../../config/database');

// -------------------------------------------------------------------
// DDL — run once to provision the table (called on server startup)
// -------------------------------------------------------------------

const CREATE_TABLES_SQL = `
  -- Enum: machine lifecycle status
  DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM (
      'OPTIMAL', 'WARNING', 'CRITICAL', 'IN_REPAIR', 'SCRAPPED'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  -- Core machines table
  CREATE TABLE IF NOT EXISTS machines (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(150) NOT NULL,
    model_number      VARCHAR(100),
    manufacturer      VARCHAR(150),
    status            machine_status NOT NULL DEFAULT 'OPTIMAL',
    installation_date DATE,
    location          VARCHAR(200),
    notes             TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );

  -- Auto-update updated_at on every row change
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS set_machines_updated_at ON machines;
  CREATE TRIGGER set_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initSchema() {
    await pool.query(CREATE_TABLES_SQL);
    console.log('[Model] machines table ready');
}

// -------------------------------------------------------------------
// Repository methods
// -------------------------------------------------------------------

/**
 * Fetch all machines. Admins see every row; technicians
 * will later be filtered by assignment (Phase 3).
 */
async function findAll({ status } = {}) {
    let query = 'SELECT * FROM machines';
    const params = [];
    if (status) {
        params.push(status.toUpperCase());
        query += ` WHERE status = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
}

/** Fetch a single machine by its UUID. Returns null if not found. */
async function findById(id) {
    const { rows } = await pool.query(
        'SELECT * FROM machines WHERE id = $1',
        [id]
    );
    return rows[0] || null;
}

/** Insert a new machine. Returns the created row. */
async function create({ name, model_number, manufacturer, installation_date, location, notes }) {
    const { rows } = await pool.query(
        `INSERT INTO machines (name, model_number, manufacturer, installation_date, location, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [name, model_number, manufacturer, installation_date, location, notes]
    );
    return rows[0];
}

/** Partial update — only touches fields that are provided. */
async function update(id, fields) {
    const allowed = ['name', 'model_number', 'manufacturer', 'status', 'installation_date', 'location', 'notes'];
    const setClauses = [];
    const params = [];

    for (const key of allowed) {
        if (fields[key] !== undefined) {
            params.push(fields[key]);
            setClauses.push(`${key} = $${params.length}`);
        }
    }

    if (setClauses.length === 0) return findById(id);

    params.push(id);
    const { rows } = await pool.query(
        `UPDATE machines SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
    );
    return rows[0] || null;
}

/** Soft-delete via status change rather than hard delete to preserve audit trail. */
async function remove(id) {
    const { rows } = await pool.query(
        `UPDATE machines SET status = 'SCRAPPED' WHERE id = $1 RETURNING id`,
        [id]
    );
    return rows[0] || null;
}

/** Quick status counts — used by the health-check and dashboard APIs. */
async function getStatusSummary() {
    const { rows } = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM machines
    GROUP BY status
  `);
    return rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
    }, {});
}

module.exports = { initSchema, findAll, findById, create, update, remove, getStatusSummary };
