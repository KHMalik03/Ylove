const express = require('express');
const Swipe = require('../models/swipe');

const router = express.Router();

// Create a new swipe
router.post('/swipes', async (req, res) => {
    try {
        const swipe = await Swipe.create(req.body);
        res.status(201).json(swipe);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create swipe' });
    }
});

// Get a swipe by ID
router.get('/swipes/:id', async (req, res) => {
    try {
        const swipe = await Swipe.readById(req.params.id);
        if (swipe) {
            res.json(swipe);
        } else {
            res.status(404).json({ error: 'Swipe not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve swipe' });
    }
});

// Get all swipes by a swiper ID
router.get('/swipes/swiper/:swiper_id', async (req, res) => {
    try {
        const swipes = await Swipe.getSwipesBySwiperId(req.params.swiper_id);
        res.json(swipes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve swipes' });
    }
});

// Get all swipes on a user (by swiped ID)
router.get('/swipes/swiped/:swiped_id', async (req, res) => {
    try {
        const swipes = await Swipe.getSwipesBySwipedId(req.params.swiped_id);
        res.json(swipes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve swipes' });
    }
});

// Delete a swipe
router.delete('/swipes/:id', async (req, res) => {
    try {
        const deleted = await Swipe.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Swipe not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete swipe' });
    }
});

module.exports = router;
