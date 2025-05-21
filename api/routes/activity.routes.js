// api/routes/activity.routes.js
const express = require('express');
const activityController = require('../controllers/activity.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Update user activity status (ping)
router.post('/ping', protect, async (req, res) => {
  try {
    await activityController.updateUserActivity(req.user.user_id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in activity ping route:', error);
    res.status(500).json({ error: 'Failed to update activity status' });
  }
});

// Set user offline (on logout)
router.post('/offline', protect, async (req, res) => {
  try {
    await activityController.setUserOffline(req.user.user_id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in offline route:', error);
    res.status(500).json({ error: 'Failed to update activity status' });
  }
});

module.exports = router;