// src/modules/equipment/equipment.routes.js
//
// GET    /api/v1/equipment          — list all (supports ?status=&type=&location=)
// GET    /api/v1/equipment/:id      — single equipment detail
// POST   /api/v1/equipment          — create  [ADMIN only]
// PUT    /api/v1/equipment/:id      — full update  [ADMIN only]
// DELETE /api/v1/equipment/:id      — soft-delete → SCRAPPED  [ADMIN only]

const router = require('express').Router();
const model = require('./equipment.model');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------
const VALID_STATUSES = ['OPTIMAL', 'WARNING', 'CRITICAL', 'IN_REPAIR', 'SCRAPPED'];

function validateEquipmentBody(body, requireName = true) {
    const errors = [];
    if (requireName && !body.name?.trim()) errors.push('name is required');
    if (body.status && !VALID_STATUSES.includes(body.status.toUpperCase())) {
        errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    return errors;
}

// ---------------------------------------------------------------------------
// GET /api/v1/equipment
// Both ADMIN and TECHNICIAN can list equipment.
// ---------------------------------------------------------------------------
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { status, type, location } = req.query;
        const equipment = await model.findAll({ status, type, location });
        res.json({
            success: true,
            count: equipment.length,
            data: equipment,
        });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// GET /api/v1/equipment/:id
// ---------------------------------------------------------------------------
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const equipment = await model.findById(req.params.id);
        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }
        res.json({ success: true, data: equipment });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// POST /api/v1/equipment   [ADMIN only]
// Body: { name, type, location, status? }
// ---------------------------------------------------------------------------
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const errors = validateEquipmentBody(req.body, true);
        if (errors.length) {
            return res.status(400).json({ success: false, message: errors.join('; ') });
        }

        const equipment = await model.create({
            name: req.body.name.trim(),
            type: req.body.type?.trim(),
            location: req.body.location?.trim(),
            status: req.body.status?.toUpperCase(),
        });

        res.status(201).json({
            success: true,
            message: 'Equipment created',
            data: equipment,
        });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/equipment/:id   [ADMIN only]
// Body: any subset of { name, type, location, status }
// ---------------------------------------------------------------------------
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const errors = validateEquipmentBody(req.body, false);
        if (errors.length) {
            return res.status(400).json({ success: false, message: errors.join('; ') });
        }

        const equipment = await model.update(req.params.id, {
            name: req.body.name?.trim(),
            type: req.body.type?.trim(),
            location: req.body.location?.trim(),
            status: req.body.status?.toUpperCase(),
        });

        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }

        res.json({ success: true, message: 'Equipment updated', data: equipment });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/equipment/:id   [ADMIN only]
// Soft-delete: sets status → SCRAPPED (preserves maintenance history)
// ---------------------------------------------------------------------------
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const result = await model.remove(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }
        res.json({
            success: true,
            message: `Equipment "${result.name}" marked as SCRAPPED`,
            data: result,
        });
    } catch (err) { next(err); }
});

module.exports = router;
