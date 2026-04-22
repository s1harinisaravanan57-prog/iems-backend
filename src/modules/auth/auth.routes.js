// src/modules/auth/auth.routes.js
// POST /api/v1/auth/login  — validates credentials, returns a signed JWT.

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal password check without bcrypt for Phase 1 simplicity.
 * Replace with bcrypt.compare() before going to production.
 */
function verifyPassword(plain, stored) {
    // TODO Phase 2: return await bcrypt.compare(plain, stored)
    return plain === stored;
}

function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const { rows } = await pool.query(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = $1 LIMIT 1',
            [email.toLowerCase().trim()]
        );

        const user = rows[0];
        if (!user || !verifyPassword(password, user.password_hash)) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = signToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// GET /api/v1/auth/me  — returns the profile of the currently logged-in user
// ---------------------------------------------------------------------------
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
});

module.exports = router;
