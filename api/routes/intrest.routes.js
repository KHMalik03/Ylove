const express = require('express');
const Interest = require('../models/interest');

const router = express.Router();

// Create a new interest
router.post('/interests', async (req, res) => {
    try {
        const interest = await Interest.create(req.body);
        res.status(201).json(interest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create interest' });
    }
});

// Get an interest by ID
router.get('/interests/:id', async (req, res) => {
    try {
        const interest = await Interest.readById(req.params.id);
        if (interest) {
            res.json(interest);
        } else {
            res.status(404).json({ error: 'Interest not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve interest' });
    }
});

// Update an interest
router.put('/interests/:id', async (req, res) => {
    try {
        const updatedInterest = await Interest.update(req.params.id, req.body);
        if (updatedInterest) {
            res.json(updatedInterest);
        } else {
            res.status(404).json({ error: 'Interest not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update interest' });
    }
});

// Delete an interest
router.delete('/interests/:id', async (req, res) => {
    try {
        const deleted = await Interest.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Interest not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete interest' });
    }
});

module.exports = router;
