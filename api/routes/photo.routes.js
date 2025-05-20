const express = require('express');
const router = express.Router();
const Photo = require('../models/photo.model.js');

// Create a new photo
router.post('/', async (req, res) => {
    try {
        console.log('Creating photo with data:', req.body);
        const photo = await Photo.create(req.body);
        res.status(201).json(photo);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ message: 'Error creating photo', error: error.message });
    }
});

// Get a photo by ID
router.get('/:id', async (req, res) => {
    try {
        const photo = await Photo.read(req.params.id);
        if (photo) {
            res.json(photo);
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving photo', error: error.message });
    }
});

// Get all photos for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const photos = await Photo.getUserPhotos(req.params.userId);
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user photos', error: error.message });
    }
});

// Get profile picture for a user
router.get('/user/:userId/profile', async (req, res) => {
    try {
        const photo = await Photo.getProfilePicture(req.params.userId);
        if (photo) {
            res.json(photo);
        } else {
            res.status(404).json({ message: 'Profile picture not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile picture', error: error.message });
    }
});

// Update a photo
router.put('/:id', async (req, res) => {
    try {
        const photo = await Photo.update(req.params.id, req.body);
        if (photo) {
            res.json(photo);
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating photo', error: error.message });
    }
});

// Set a photo as profile picture
router.put('/:id/set-profile', async (req, res) => {
    try {
        const photo = await Photo.setProfilePicture(req.params.id, req.body.user_id);
        if (photo) {
            res.json(photo);
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error setting profile picture', error: error.message });
    }
});

// Delete a photo
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Photo.delete(req.params.id);
        if (deleted) {
            res.json({ message: 'Photo deleted successfully' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting photo', error: error.message });
    }
});

// Reorder user photos
router.post('/user/:userId/reorder', async (req, res) => {
    try {
        const photos = await Photo.reorderPhotos(req.params.userId, req.body.photoOrders);
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Error reordering photos', error: error.message });
    }
});

module.exports = router;