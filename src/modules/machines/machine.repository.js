// src/modules/equipment/equipment.model.js
// Repository layer for the `equipment` table.
// All SQL lives here; routes stay clean.

const { pool } = require('../../config/database');

// ---------------------------------------------------------------------------
// Schema bootstrap (idempotent — safe to call on every startup)
// ---------------------------------------------------------------------------
const CREATE_TABLE_SQL = `
  DO $$ BEGIN
    CREATE TYPE equipment_status AS ENUM (
      'OPTIMAL', 'WARNING', 'CRITICAL', 'IN_REPAIR', 'SCRAPPED'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  CREATE TABLE IF NOT EXISTS equipment (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(150)  NOT NULL,
    type         VARCHAR(100),
    location     VARCHAR(200),
    status       equipment_status NOT NULL DEFAULT 'OPTIMAL',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );

  CREATE OR REPLACE FUNCTION update_equipment_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_equipment_updated_at ON equipment;
  CREATE TRIGGER trg_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_equipment_updated_at();

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  INSERT INTO users (name, email, password_hash, role)
  VALUES ('Admin User', 'admin@iems.io', 'admin123', 'ADMIN')
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO users (name, email, password_hash, role)
  VALUES ('Tech User', 'tech@iems.io', 'tech123', 'TECHNICIAN')
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO users (name, email, password_hash, role)
  VALUES ('Harini', 's1harinisaravanan57@gmail.com', 'Admin@123', 'ADMIN')
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

  INSERT INTO users (name, email, password_hash, role)
  VALUES 
    ('John Doe', 'johndoe@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Jane Smith', 'janesmith@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Michael Johnson', 'michaeljohnson@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Emily Davis', 'emilydavis@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('David Wilson', 'davidwilson@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Sarah Brown', 'sarahbrown@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('James Taylor', 'jamestaylor@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Linda Anderson', 'lindaanderson@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Robert Thomas', 'robertthomas@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Susan Jackson', 'susanjackson@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('William White', 'williamwhite@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Jessica Harris', 'jessicaharris@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Joseph Martin', 'josephmartin@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Karen Thompson', 'karenthompson@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Charles Garcia', 'charlesgarcia@tech.com', 'Tech@123', 'TECHNICIAN'),
    ('Mark Young', 'markyoung@tech.com', 'Tech@123', 'TECHNICIAN')
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
`;

async function initSchema() {
  await pool.query(CREATE_TABLE_SQL);
  console.log('[Model] equipment table ready');
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

async function findAll({ status, type, location } = {}) {
  const conditions = [];
  const params = [];

  if (status) { params.push(status.toUpperCase()); conditions.push(`status = $${params.length}`); }
  if (type) { params.push(`%${type}%`); conditions.push(`type ILIKE $${params.length}`); }
  if (location) { params.push(`%${location}%`); conditions.push(`location ILIKE $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM equipment ${where} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, type, location, status }) {
  const { rows } = await pool.query(
    `INSERT INTO equipment (name, type, location, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, type, location, status || 'OPTIMAL']
  );
  return rows[0];
}

async function update(id, fields) {
  const allowed = ['name', 'type', 'location', 'status'];
  const setClauses = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      setClauses.push(`${key} = $${params.length}`);
    }
  }

  if (!setClauses.length) return findById(id);

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE equipment SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rows } = await pool.query(
    `UPDATE equipment SET status = 'SCRAPPED' WHERE id = $1 RETURNING id, name, status`,
    [id]
  );
  return rows[0] || null;
}

async function getStatusSummary() {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*) AS count FROM equipment GROUP BY status`
  );
  return rows.reduce((acc, r) => { acc[r.status] = parseInt(r.count, 10); return acc; }, {});
}

module.exports = { initSchema, findAll, findById, create, update, remove, getStatusSummary };
