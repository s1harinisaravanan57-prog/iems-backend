const express = require('express');
const router = express.Router();

// Example GET route
router.get('/', (req, res) => {
    res.json({ message: 'Machines API is working!' });
});

// Example POST route
router.post('/', (req, res) => {
    const { name, status } = req.body;
    // Normally you’d call machineService.createMachine(name, status)
    res.json({ message: `Machine ${name} with status ${status} created.` });
});

module.exports = router;