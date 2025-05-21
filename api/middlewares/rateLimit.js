const { pool } = require('../database');

exports.limitSwipes = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    // Get swipe count in last 24 hours
    const [result] = await pool.query(
      `SELECT COUNT(*) AS count FROM swipe 
       WHERE swiper_id = ? 
       AND timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [userId]
    );
    
    const count = result[0].count;
    const limit = 100; // Set appropriate limit
    
    if (count >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have reached your daily swipe limit'
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.limitMessages = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    // Get message count in last hour
    const [result] = await pool.query(
      `SELECT COUNT(*) AS count FROM message 
       WHERE sender_id = ? 
       AND timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [userId]
    );
    
    const count = result[0].count;
    const limit = 50; // Set appropriate limit
    
    if (count >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have reached your hourly message limit'
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};