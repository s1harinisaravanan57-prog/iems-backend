const { pool } = require('../../config/database');

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS maintenance (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id   UUID          NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    technician_id  UUID          REFERENCES users(id) ON DELETE SET NULL,
    description    TEXT          NOT NULL,
    result         VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    scheduled_date DATE,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );

  CREATE OR REPLACE FUNCTION update_maintenance_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_maintenance_updated_at ON maintenance;
  CREATE TRIGGER trg_maintenance_updated_at
    BEFORE UPDATE ON maintenance
    FOR EACH ROW EXECUTE FUNCTION update_maintenance_updated_at();
`;

async function initSchema() {
    await pool.query(CREATE_TABLE_SQL);
    console.log('[Model] maintenance table ready');
}

async function findAll({ equipment_id, technician_id, result } = {}) {
    const conditions = [];
    const params = [];

    if (equipment_id) { params.push(equipment_id); conditions.push(`m.equipment_id = $${params.length}`); }
    if (technician_id) { params.push(technician_id); conditions.push(`m.technician_id = $${params.length}`); }
    if (result) { params.push(result.toUpperCase()); conditions.push(`m.result = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
        `SELECT m.*, e.name as equipment_name, u.name as technician_name 
         FROM maintenance m 
         LEFT JOIN equipment e ON m.equipment_id = e.id 
         LEFT JOIN users u ON m.technician_id = u.id 
         ${where} ORDER BY m.created_at DESC`,
        params
    );
    return rows;
}

async function findById(id) {
    const { rows } = await pool.query(
        `SELECT m.*, e.name as equipment_name, u.name as technician_name 
         FROM maintenance m 
         LEFT JOIN equipment e ON m.equipment_id = e.id 
         LEFT JOIN users u ON m.technician_id = u.id 
         WHERE m.id = $1`,
        [id]
    );
    return rows[0] || null;
}

async function create({ equipment_id, technician_id, scheduled_date, description, result }) {
    const { rows } = await pool.query(
        `INSERT INTO maintenance (equipment_id, technician_id, scheduled_date, description, result)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [equipment_id, technician_id, scheduled_date, description, result || 'PENDING']
    );
    return rows[0];
}

async function update(id, fields) {
    const allowed = ['technician_id', 'scheduled_date', 'description', 'result', 'completed_at'];
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
        `UPDATE maintenance SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
    );
    return rows[0] || null;
}

module.exports = { initSchema, findAll, findById, create, update };