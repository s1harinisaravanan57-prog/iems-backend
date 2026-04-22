// src/middlewares/auth.middleware.js
// Verifies the JWT on every protected route.
// Usage: router.get('/equipment', authenticate, handler)
//        router.post('/equipment', authenticate, authorize('ADMIN'), handler)

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

/**
 * authenticate
 * Reads the Bearer token from Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 */
function authenticate(req, res, next) {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        return res.status(401).json({ success: false, message });
    }
}

/**
 * authorize(...roles)
 * Role-based guard. Must be used after authenticate.
 * Example: authorize('ADMIN') or authorize('ADMIN', 'TECHNICIAN')
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }
        next();
    };
}

module.exports = { authenticate, authorize };
