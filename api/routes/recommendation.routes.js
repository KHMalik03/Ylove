const express = require('express');
const recommendationController = require('../controllers/recommendation.controllers');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Get swipe recommendations
router.get('/swipe-recommendations', protect, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const recommendations = await recommendationController.getSwipeRecommendations(req.user.user_id, limit);
    res.json(recommendations);
  } catch (error) {
    console.error('Error in swipe recommendations route:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get compatibility score
router.get('/compatibility/:userId', protect, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    
    if (targetUserId === req.user.user_id) {
      return res.status(400).json({ error: 'Cannot calculate compatibility with yourself' });
    }
    
    const compatibility = await recommendationController.getCompatibilityScore(req.user.user_id, targetUserId);
    res.json(compatibility);
  } catch (error) {
    console.error('Error in compatibility route:', error);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

module.exports = router;