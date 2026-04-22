// src/modules/users/users.routes.js
// GET /api/v1/users — list all workers/technicians

const router = require('express').Router();
const { pool } = require('../../config/database');
const { authenticate } = require('../../middlewares/auth.middleware');

// ---------------------------------------------------------------------------
// GET /api/v1/users
// ---------------------------------------------------------------------------
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, email, role, work_place, leave_taken, leave_allocated, created_at FROM users WHERE role != \'ADMIN\' ORDER BY created_at DESC'
        );
        res.json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// POST /api/v1/users
// Body: { name, email, password? }
// ---------------------------------------------------------------------------
router.post('/', authenticate, async (req, res, next) => {
    try {
        // Enforce user is ADMIN
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied: ALDMIN only' });
        }

        let { name, email, password, role, work_place, leave_taken, leave_allocated } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'name and email are required' });
        }

        password = password || 'tech123'; // Default password for new techs
        const validRoles = ['MANAGER', 'TECHNICIAN', 'OPERATOR'];
        role = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'TECHNICIAN';

        // Set defaults if not provided
        work_place = work_place || 'zoneA';
        leave_taken = leave_taken !== undefined ? leave_taken : 0;
        leave_allocated = leave_allocated !== undefined ? leave_allocated : 5;

        // Check for existing user
        const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.length) {
             return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, work_place, leave_taken, leave_allocated)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, work_place, leave_taken, leave_allocated, created_at`,
            [name, email, password, role, work_place, leave_taken, leave_allocated]
        );

        res.status(201).json({
            success: true,
            message: 'Worker created',
            data: rows[0],
        });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/users/:id
// Update worker details (work_place, attendance, email, etc.)
// ---------------------------------------------------------------------------
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied: ADMIN only' });
        }

        const userId = req.params.id;
        const { work_place, leave_taken, leave_allocated, email } = req.body;

        const { rows } = await pool.query(
            `UPDATE users 
             SET work_place = COALESCE($1, work_place),
                 leave_taken = COALESCE($2, leave_taken),
                 leave_allocated = COALESCE($3, leave_allocated),
                 email = COALESCE($4, email)
             WHERE id = $5
             RETURNING id, name, email, role, work_place, leave_taken, leave_allocated`,
            [work_place, leave_taken, leave_allocated, email, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        res.json({
            success: true,
            message: 'Worker updated successfully',
            data: rows[0]
        });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/users/:id
// Delete a worker entirely
// ---------------------------------------------------------------------------
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied: ADMIN only' });
        }

        const userId = req.params.id;
        const { rows } = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        res.json({
            success: true,
            message: 'Worker deleted successfully'
        });
    } catch (err) { next(err); }
});

module.exports = router;
