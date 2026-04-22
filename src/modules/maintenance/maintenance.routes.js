// src/modules/maintenance/maintenance.routes.js
//
// GET  /api/v1/maintenance          — list all records  (supports ?equipment_id=&technician_id=&result=)
// GET  /api/v1/maintenance/:id      — single record detail
// POST /api/v1/maintenance          — log a new maintenance record  [ADMIN or TECHNICIAN]
// PUT  /api/v1/maintenance/:id      — update result / notes  [ADMIN or TECHNICIAN]

const router = require('express').Router();
const model = require('./maintenance.model');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const VALID_RESULTS = ['PENDING', 'DONE', 'ESCALATED'];

function validateMaintenanceBody(body, isCreate = true) {
    const errors = [];
    if (isCreate) {
        if (!body.equipment_id) errors.push('equipment_id is required');
        if (!body.description?.trim()) errors.push('description is required');
    }
    if (body.result && !VALID_RESULTS.includes(body.result.toUpperCase())) {
        errors.push(`result must be one of: ${VALID_RESULTS.join(', ')}`);
    }
    if (body.scheduled_date && isNaN(Date.parse(body.scheduled_date))) {
        errors.push('scheduled_date must be a valid date (YYYY-MM-DD)');
    }
    return errors;
}

// ---------------------------------------------------------------------------
// GET /api/v1/maintenance
// ---------------------------------------------------------------------------
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { equipment_id, technician_id, result } = req.query;

        // Technicians can only see their own records unless they're ADMIN
        const filters = { equipment_id, result };
        if (req.user.role === 'TECHNICIAN') {
            filters.technician_id = req.user.id;  // enforce scope
        } else {
            filters.technician_id = technician_id; // ADMIN can filter freely
        }

        const records = await model.findAll(filters);
        res.json({ success: true, count: records.length, data: records });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// GET /api/v1/maintenance/:id
// ---------------------------------------------------------------------------
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const record = await model.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Maintenance record not found' });
        }

        // Technicians can only view their own records
        if (req.user.role === 'TECHNICIAN' && record.technician_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, data: record });
    } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// POST /api/v1/maintenance   [ADMIN or TECHNICIAN]
// Body: { equipment_id, technician_id?, scheduled_date?, description, result? }
// ---------------------------------------------------------------------------
router.post('/', authenticate, authorize('ADMIN', 'TECHNICIAN'), async (req, res, next) => {
    try {
        const errors = validateMaintenanceBody(req.body, true);
        if (errors.length) {
            return res.status(400).json({ success: false, message: errors.join('; ') });
        }

        const technician_id = req.body.technician_id || req.user.id;

        const record = await model.create({
            equipment_id: req.body.equipment_id,
            technician_id,
            scheduled_date: req.body.scheduled_date || new Date().toISOString().split('T')[0],
            description: req.body.description.trim(),
            result: req.body.result?.toUpperCase() || 'PENDING',
        });

        res.status(201).json({
            success: true,
            message: 'Maintenance record created',
            data: record,
        });
    } catch (err) {
        // Foreign key violation — equipment_id or technician_id doesn't exist
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Invalid equipment_id or technician_id — referenced record does not exist',
            });
        }
        next(err);
    }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/maintenance/:id   [ADMIN or TECHNICIAN]
// Body: any subset of { technician_id, scheduled_date, description, result, completed_at }
// ---------------------------------------------------------------------------
router.put('/:id', authenticate, authorize('ADMIN', 'TECHNICIAN'), async (req, res, next) => {
    try {
        const errors = validateMaintenanceBody(req.body, false);
        if (errors.length) {
            return res.status(400).json({ success: false, message: errors.join('; ') });
        }

        const existing = await model.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Maintenance record not found' });
        }

        // Technicians may only update their own records
        if (req.user.role === 'TECHNICIAN' && existing.technician_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const updated = await model.update(req.params.id, {
            technician_id: req.user.role === 'ADMIN' ? req.body.technician_id : undefined,
            scheduled_date: req.body.scheduled_date,
            description: req.body.description?.trim(),
            result: req.body.result?.toUpperCase(),
            completed_at: req.body.completed_at,
        });

        res.json({ success: true, message: 'Maintenance record updated', data: updated });
    } catch (err) { next(err); }
});

module.exports = router;
