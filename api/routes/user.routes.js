const express = require('express');
const User = require('../models/user.model');

const router = express.Router();

// Create a new user
router.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Get a user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User  not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
});

// Update a user
router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser  = await User.update(req.params.id, req.body);
        if (updatedUser ) {
            res.json(updatedUser );
        } else {
            res.status(404).json({ error: 'User  not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const deleted = await User.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'User  not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;