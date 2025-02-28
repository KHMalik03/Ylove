const express = require('express');
const Profile = require('../models/profile.model'); 

const router = express.Router();

// Create a new profile
router.post('/profiles', async (req, res) => {
    try {
        const newProfile = await Profile.create(req.body);
        res.status(201).json(newProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a profile by ID
router.get('/profiles/:id', async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a profile
router.put('/profiles/:id', async (req, res) => {
    try {
        const updatedProfile = await Profile.update(req.params.id, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a profile
router.delete('/profiles/:id', async (req, res) => {
    try {
        const result = await Profile.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile location
router.put('/profiles/:id/location', async (req, res) => {
    try {
        const updatedProfile = await Profile.updateLocation(req.params.id, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle profile visibility
router.patch('/profiles/:id/visibility', async (req, res) => {
    try {
        const updatedProfile = await Profile.toggleVisibility(req.params.id);
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;