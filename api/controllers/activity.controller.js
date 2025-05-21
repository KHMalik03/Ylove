// api/controllers/activity.controller.js
const { pool } = require('../database');
const { deleteCache } = require('../utils/cache');
const { userKeys } = require('../utils/cacheKeys');

// Update user's last active timestamp and online status
exports.updateUserActivity = async (userId) => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await pool.query(
      'UPDATE user SET last_active = ?, is_online = TRUE WHERE user_id = ?',
      [timestamp, userId]
    );
    
    // Clear user cache to reflect the updated status
    deleteCache(userKeys.user(userId));
    deleteCache(userKeys.auth(userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user activity:', error);
    throw error;
  }
};

// Set user as offline
exports.setUserOffline = async (userId) => {
  try {
    await pool.query(
      'UPDATE user SET is_online = FALSE WHERE user_id = ?',
      [userId]
    );
    
    // Clear user cache
    deleteCache(userKeys.user(userId));
    deleteCache(userKeys.auth(userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
};

// Get recently active users (for admin dashboard)
exports.getRecentlyActiveUsers = async (minutes = 15, limit = 100) => {
  try {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);
    const formattedCutoff = cutoffTime.toISOString().slice(0, 19).replace('T', ' ');
    
    const [users] = await pool.query(
      `SELECT u.user_id, u.last_active, u.is_online, p.name, 
        (SELECT img_URL FROM photo WHERE user_id = u.user_id AND is_profile_picture = TRUE LIMIT 1) AS profile_photo
      FROM user u
      LEFT JOIN profile p ON u.user_id = p.user_id
      WHERE u.last_active > ?
      ORDER BY u.last_active DESC
      LIMIT ?`,
      [formattedCutoff, limit]
    );
    
    return users;
  } catch (error) {
    console.error('Error getting recently active users:', error);
    throw error;
  }
};