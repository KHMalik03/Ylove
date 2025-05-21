const { pool } = require('../database');

// Rate limit middleware factory
const createRateLimiter = (resource, limit, periodMinutes) => {
  return async (req, res, next) => {
    const userId = req.user.user_id;
    
    try {
      // Check recent activity
      const periodStart = new Date();
      periodStart.setMinutes(periodStart.getMinutes() - periodMinutes);
      const formattedPeriodStart = periodStart.toISOString().slice(0, 19).replace('T', ' ');
      
      // Get count of actions in the period
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as count FROM ${resource} 
         WHERE ${resource === 'swipe' ? 'swiper_id' : 'user_id'} = ? 
         AND timestamp > ?`,
        [userId, formattedPeriodStart]
      );
      
      const count = countResult[0].count;
      
      if (count >= limit) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `You have reached your ${resource} limit for the time period`,
          resetAt: new Date(periodStart.getTime() + periodMinutes * 60000).toISOString()
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next(error);
    }
  };
};

// Create specific limiters
exports.limitSwipes = createRateLimiter('swipe', 100, 24 * 60); // 100 swipes per day
exports.limitMessages = createRateLimiter('message', 200, 24 * 60); // 200 messages per day