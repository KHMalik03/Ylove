const express = require('express');
const Swipe = require('../models/swipe.model.js');

const router = express.Router();

// Create a new swipe
router.post('/', async (req, res) => {
    try {
        console.log('Creating swipe with data:', req.body);
        const swipe = await Swipe.create(req.body);
        console.log('Swipe created:', swipe);
        res.status(201).json(swipe);
    } catch (error) {
        console.error('Error in create route:', error);
        res.status(500).json({ 
            error: 'Failed to create swipe', 
            message: error.message 
        });
    }
});

// Get all swipes by a swiper ID
router.get('/swiper/:swiper_id', async (req, res) => {
    try {
        console.log('Getting swipes for swiper:', req.params.swiper_id);
        const swipes = await Swipe.getSwipesBySwiperId(req.params.swiper_id);
        res.json(swipes);
    } catch (error) {
        console.error('Error in get swipes by swiper route:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve swipes', 
            message: error.message 
        });
    }
});

// Get all swipes on a user (by swiped ID)
router.get('/swiped/:swiped_id', async (req, res) => {
    try {
        console.log('Getting swipes for swiped user:', req.params.swiped_id);
        const swipes = await Swipe.getSwipesBySwipedId(req.params.swiped_id);
        res.json(swipes);
    } catch (error) {
        console.error('Error in get swipes by swiped route:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve swipes', 
            message: error.message 
        });
    }
});

// Get a swipe by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('Getting swipe by ID:', req.params.id);
        const swipe = await Swipe.readById(req.params.id);
        if (swipe) {
            res.json(swipe);
        } else {
            res.status(404).json({ error: 'Swipe not found' });
        }
    } catch (error) {
        console.error('Error in get swipe by ID route:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve swipe', 
            message: error.message 
        });
    }
});

// Delete a swipe
router.delete('/:id', async (req, res) => {
    try {
        console.log('Deleting swipe with ID:', req.params.id);
        const deleted = await Swipe.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Swipe not found' });
        }
    } catch (error) {
        console.error('Error in delete route:', error);
        res.status(500).json({ 
            error: 'Failed to delete swipe', 
            message: error.message 
        });
    }
});

module.exports = router;