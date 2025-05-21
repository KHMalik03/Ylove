const activityController = require('../controllers/activity.controller');

// Middleware to track user activity
const trackActivity = async (req, res, next) => {
  try {
    if (req.user && req.user.user_id) {
      // Update activity in background without waiting for response
      activityController.updateUserActivity(req.user.user_id).catch(err => {
        console.error('Background activity update error:', err);
      });
    }
    next();
  } catch (error) {
    // If there's an error, just log it and continue
    console.error('Activity tracking error:', error);
    next();
  }
};

module.exports = trackActivity;