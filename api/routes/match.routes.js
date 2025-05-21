// api/routes/match.routes.js
const express = require('express');
const matchController = require('../controllers/match.controllers');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Get all matches for current user
router.get('/user/me', protect, async (req, res) => {
  try {
    const matches = await matchController.getUserMatches(req.user.user_id);
    res.json(matches);
  } catch (error) {
    console.error('Error in get user matches route:', error);
    res.status(500).json({ error: 'Failed to retrieve matches' });
  }
});

// Get specific match by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const match = await matchController.findMatchById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Verify user is part of the match
    if (match.user_id_1 !== req.user.user_id && match.user_id_2 !== req.user.user_id) {
      return res.status(403).json({ error: 'You are not authorized to view this match' });
    }
    
    res.json(match);
  } catch (error) {
    console.error('Error in get match by ID route:', error);
    res.status(500).json({ error: 'Failed to retrieve match' });
  }
});

// Update match status (unmatch)
router.put('/:id', protect, async (req, res) => {
  try {
    const { is_active } = req.body;
    
    if (is_active === undefined) {
      return res.status(400).json({ error: 'is_active status is required' });
    }
    
    // Verify user is part of the match
    const match = await matchController.findMatchById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    if (match.user_id_1 !== req.user.user_id && match.user_id_2 !== req.user.user_id) {
      return res.status(403).json({ error: 'You are not authorized to update this match' });
    }
    
    const updatedMatch = await matchController.updateMatchStatus(req.params.id, is_active);
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error in update match route:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Delete a match (permanent)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Verify user is part of the match
    const match = await matchController.findMatchById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    if (match.user_id_1 !== req.user.user_id && match.user_id_2 !== req.user.user_id) {
      return res.status(403).json({ error: 'You are not authorized to delete this match' });
    }
    
    const deleted = await matchController.deleteMatch(req.params.id);
    
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Match not found' });
    }
  } catch (error) {
    console.error('Error in delete match route:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

module.exports = router;