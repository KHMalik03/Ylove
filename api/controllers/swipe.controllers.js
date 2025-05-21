// api/controllers/swipe.controllers.js
const { pool } = require('../database');
const { deleteCache, deleteCachePattern } = require('../utils/cache');

// Controller to create a new swipe
exports.createSwipe = async (swipeData) => {
  const { swiper_id, swiped_id, direction } = swipeData;
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Vérifier si les utilisateurs existent
    const [usersExist] = await connection.query(
      'SELECT COUNT(*) as count FROM user WHERE user_id IN (?, ?)',
      [swiper_id, swiped_id]
    );
    
    if (usersExist[0].count < 2) {
      await connection.rollback();
      throw new Error('One or both users do not exist');
    }
    
    // Create the swipe
    const [result] = await connection.query(
      'INSERT INTO swipe (swiper_id, swiped_id, direction, timestamp) VALUES (?, ?, ?, ?)',
      [swiper_id, swiped_id, direction, timestamp]
    );
    
    // Clear recommendation cache
    deleteCachePattern(`recommendations_${swiper_id}`);
    
    // Get created swipe
    const [rows] = await connection.query('SELECT * FROM swipe WHERE swipe_id = ?', [result.insertId]);
    let matchCreated = null;
    
    // If swipe is right (like), check for mutual like
    if (direction === true) {
      // Check for mutual like
      const [mutualLike] = await connection.query(
        'SELECT * FROM swipe WHERE swiper_id = ? AND swiped_id = ? AND direction = TRUE',
        [swiped_id, swiper_id]
      );
      
      // If mutual like exists, create a match
      if (mutualLike.length > 0) {
        const [matchResult] = await connection.query(
          'INSERT INTO `match` (user_id_1, user_id_2, created_at, is_active) VALUES (?, ?, ?, ?)',
          [swiper_id, swiped_id, timestamp, true]
        );
        
        // Clear match caches for both users
        deleteCachePattern(`mutual_matches_${swiper_id}`);
        deleteCachePattern(`mutual_matches_${swiped_id}`);
        
        // Get the created match
        const [matchRows] = await connection.query('SELECT * FROM `match` WHERE match_id = ?', [matchResult.insertId]);
        matchCreated = matchRows[0];
        
        // Create initial welcome message
        const welcomeMessage = "We matched! Let's start a conversation.";
        await connection.query(
          'INSERT INTO message (match_id, sender_id, content, timestamp, read_status) VALUES (?, ?, ?, ?, ?)',
          [matchResult.insertId, swiper_id, welcomeMessage, timestamp, false]
        );
      }
    }
    
    await connection.commit();
    
    return {
      swipe: rows[0],
      match: matchCreated
    };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating swipe:', error);
    throw new Error('Failed to create swipe: ' + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Controller to get a swipe by ID with caching
exports.getSwipeById = async (swipeId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM swipe WHERE swipe_id = ?', [swipeId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error retrieving swipe:', error);
    throw new Error('Failed to retrieve swipe: ' + error.message);
  }
};

// Controller to get all swipes by a swiper_id
exports.getSwipesBySwiperId = async (swiperId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM swipe WHERE swiper_id = ?', [swiperId]);
    return rows;
  } catch (error) {
    console.error('Error retrieving swipes by swiper:', error);
    throw new Error('Failed to retrieve swipes: ' + error.message);
  }
};

// Controller to delete a swipe
exports.deleteSwipe = async (swipeId) => {
  try {
    // Get swipe before deleting to clear related caches
    const [swipeData] = await pool.query('SELECT * FROM swipe WHERE swipe_id = ?', [swipeId]);
    
    if (swipeData.length === 0) {
      return false;
    }
    
    const { swiper_id, swiped_id } = swipeData[0];
    
    const [result] = await pool.query('DELETE FROM swipe WHERE swipe_id = ?', [swipeId]);
    
    // Clear recommendation caches
    deleteCachePattern(`recommendations_${swiper_id}`);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting swipe:', error);
    throw new Error('Failed to delete swipe: ' + error.message);
  }
};