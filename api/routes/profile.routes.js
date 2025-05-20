const express = require('express');
const Profile = require('../models/profile.model');

const router = express.Router();

// Create a new profile
router.post('/', async (req, res) => {
    try {
        const profile = await Profile.create(req.body);
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create profile' });
    }
});

// Get a profile by ID
router.get('/:id', async (req, res) => {
    try {
        const profile = await Profile.readById(req.params.id);
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
});

// Update a profile
router.put('/:id', async (req, res) => {
    try {
        const updatedProfile = await Profile.update(req.params.id, req.body);
        if (updatedProfile) {
            res.json(updatedProfile);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Delete a profile
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Profile.delete(req.params.id);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

module.exports = router;
