const express = require('express');
const router = express.Router();

// Simple health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'Industrial Equipment Management System',
        timestamp: new Date()
    });
});

module.exports = router;
