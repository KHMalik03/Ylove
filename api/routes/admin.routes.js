const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const activityController = require('../controllers/activity.controller');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

// Get app statistics for dashboard
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const stats = await dashboardController.getAppStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in admin stats route:', error);
    res.status(500).json({ error: 'Failed to get app statistics' });
  }
});

// Get report statistics
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const reportStats = await dashboardController.getUserReportStats();
    res.json(reportStats);
  } catch (error) {
    console.error('Error in admin reports route:', error);
    res.status(500).json({ error: 'Failed to get report statistics' });
  }
});

// Get recently active users
router.get('/active-users', adminAuth, async (req, res) => {
  try {
    const minutes = req.query.minutes ? parseInt(req.query.minutes) : 15;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    
    const activeUsers = await activityController.getRecentlyActiveUsers(minutes, limit);
    res.json(activeUsers);
  } catch (error) {
    console.error('Error in active users route:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

module.exports = router;