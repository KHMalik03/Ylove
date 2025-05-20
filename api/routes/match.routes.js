const express = require('express');
const Match = require('../models/match.model.js');

const router = express.Router();

// Create a new match
router.post('/', async (req, res) => {
    try {
        const match = await Match.create(req.body);
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match' });
    }
});

// Get a match by ID
router.get('/:id', async (req, res) => {
    try {
        const match = await Match.read(req.params.id);
        if (match) {
            res.json(match);
        } else {
            res.status(404).json({ error: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve match' });
    }
});

// Get all matches for a user
router.get('/user/:user_id/matches', async (req, res) => {
    try {
        const matches = await Match.getUserMatches(req.params.user_id);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve matches' });
    }
});

// Update a match's status
router.put('/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.updateMatchStatus(req.params.id, req.body.is_active);
        if (updatedMatch) {
            res.json(updatedMatch);
        } else {
            res.status(404).json({ error: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update match' });
    }
});

// Delete a match
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Match.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

// Get match count for a user
router.get('/user/:user_id/count', async (req, res) => {
    try {
        const count = await Match.getMatchCount(req.params.user_id);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve match count' });
    }
});

module.exports = router;
