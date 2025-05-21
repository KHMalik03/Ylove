// api/routes/matching.routes.js
const express = require('express');
const matchingController = require('../controllers/matching.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Get recommendations for current user
router.get('/recommendations', protect, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const recommendations = await matchingController.getRecommendations(req.user.user_id, limit);
    res.json(recommendations);
  } catch (error) {
    console.error('Error in recommendations route:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get mutual matches for current user
router.get('/matches', protect, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const matches = await matchingController.getMutualMatches(req.user.user_id, limit, offset);
    res.json(matches);
  } catch (error) {
    console.error('Error in matches route:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

module.exports = router;