// api/controllers/match.controllers.js
const { pool } = require('../database');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../utils/cache');

// Create a new match
exports.createMatch = async (matchData) => {
  const { user_id_1, user_id_2 } = matchData;
  const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const is_active = true;
  
  try {
    // Vérifier si les utilisateurs existent
    const [userCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM user WHERE user_id IN (?, ?)',
      [user_id_1, user_id_2]
    );
    
    if (userCheck[0].count < 2) {
      throw new Error('One or both users do not exist');
    }
    
    const [result] = await pool.query(
      'INSERT INTO `match` (user_id_1, user_id_2, created_at, is_active) VALUES (?, ?, ?, ?)',
      [user_id_1, user_id_2, created_at, is_active]
    );
    
    // Clear match caches for both users
    deleteCachePattern(`mutual_matches_${user_id_1}`);
    deleteCachePattern(`mutual_matches_${user_id_2}`);
    
    const [rows] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

// Find a match by ID with caching
exports.findMatchById = async (match_id) => {
  try {
    const cacheKey = `match_${match_id}`;
    let match = getCache(cacheKey);
    
    if (!match) {
      const [rows] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [match_id]);
      match = rows[0] || null;
      
      if (match) {
        setCache(cacheKey, match);
      }
    }
    
    return match;
  } catch (error) {
    console.error('Error finding match by ID:', error);
    throw error;
  }
};

// Get all matches for a user
exports.getUserMatches = async (user_id) => {
  try {
    const cacheKey = `user_matches_${user_id}`;
    let matches = getCache(cacheKey);
    
    if (!matches) {
      const [rows] = await pool.query(
        `SELECT m.*,
          (SELECT COUNT(*) FROM message 
           WHERE match_id = m.match_id 
           AND sender_id != ? 
           AND read_status = FALSE) as unread_count,
          IF(m.user_id_1 = ?, m.user_id_2, m.user_id_1) as other_user_id,
          (SELECT name FROM profile 
           WHERE user_id = IF(m.user_id_1 = ?, m.user_id_2, m.user_id_1)) as other_user_name,
          (SELECT img_URL FROM photo 
           WHERE user_id = IF(m.user_id_1 = ?, m.user_id_2, m.user_id_1)
           AND is_profile_picture = TRUE LIMIT 1) as profile_photo
         FROM \`match\` m
         WHERE (m.user_id_1 = ? OR m.user_id_2 = ?) 
         AND m.is_active = true 
         ORDER BY 
           (SELECT MAX(timestamp) FROM message WHERE match_id = m.match_id) DESC,
           m.created_at DESC`,
        [user_id, user_id, user_id, user_id, user_id, user_id]
      );
      
      matches = rows;
      setCache(cacheKey, matches, 'short'); // Short TTL as this changes frequently
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    throw error;
  }
};

// Update match status (activate/deactivate)
exports.updateMatchStatus = async (match_id, is_active) => {
  try {
    // Get match data first to clear caches
    const [matchData] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [match_id]);
    
    if (matchData.length === 0) {
      return null;
    }
    
    const { user_id_1, user_id_2 } = matchData[0];
    
    const [result] = await pool.query(
      'UPDATE `match` SET is_active = ? WHERE match_id = ?',
      [is_active, match_id]
    );
    
    // Clear caches
    deleteCache(`match_${match_id}`);
    deleteCachePattern(`user_matches_${user_id_1}`);
    deleteCachePattern(`user_matches_${user_id_2}`);
    deleteCachePattern(`mutual_matches_${user_id_1}`);
    deleteCachePattern(`mutual_matches_${user_id_2}`);
    
    if (result.affectedRows > 0) {
      const [rows] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [match_id]);
      return rows[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating match status:', error);
    throw error;
  }
};

// Delete a match
exports.deleteMatch = async (match_id) => {
  try {
    // Get match data first to clear caches
    const [matchData] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [match_id]);
    
    if (matchData.length === 0) {
      return false;
    }
    
    const { user_id_1, user_id_2 } = matchData[0];
    
    const [result] = await pool.query('DELETE FROM `match` WHERE match_id = ?', [match_id]);
    
    // Clear caches
    deleteCache(`match_${match_id}`);
    deleteCachePattern(`user_matches_${user_id_1}`);
    deleteCachePattern(`user_matches_${user_id_2}`);
    deleteCachePattern(`mutual_matches_${user_id_1}`);
    deleteCachePattern(`mutual_matches_${user_id_2}`);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
};