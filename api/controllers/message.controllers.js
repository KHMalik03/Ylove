// api/controllers/message.controllers.js
const { pool } = require('../database');
const { deleteCachePattern } = require('../utils/cache');

// Controller to create a new message
exports.createMessage = async (messageData) => {
  const { match_id, sender_id, content } = messageData;
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const read_status = false;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Verify match exists and is active
    const [matchCheck] = await connection.query(
      'SELECT * FROM `match` WHERE match_id = ? AND is_active = TRUE',
      [match_id]
    );
    
    if (matchCheck.length === 0) {
      await connection.rollback();
      throw new Error('Match not found or inactive');
    }
    
    const match = matchCheck[0];
    
    // Verify sender is part of the match
    if (match.user_id_1 !== sender_id && match.user_id_2 !== sender_id) {
      await connection.rollback();
      throw new Error('Sender is not part of this match');
    }
    
    // Get the recipient ID
    const recipient_id = match.user_id_1 === sender_id ? match.user_id_2 : match.user_id_1;
    
    // Insert message
    const [result] = await connection.query(
      'INSERT INTO message (match_id, sender_id, content, timestamp, read_status) VALUES (?, ?, ?, ?, ?)',
      [match_id, sender_id, content, timestamp, read_status]
    );
    
    // Update match with last activity
    await connection.query(
      'UPDATE `match` SET last_activity = ? WHERE match_id = ?',
      [timestamp, match_id]
    );
    
    // Clear match caches for both users
    deleteCachePattern(`mutual_matches_${match.user_id_1}`);
    deleteCachePattern(`mutual_matches_${match.user_id_2}`);
    
    // Get the created message
    const [rows] = await connection.query('SELECT * FROM message WHERE message_id = ?', [result.insertId]);
    
    await connection.commit();
    
    return rows[0];
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating message:', error);
    throw new Error('Failed to create message: ' + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Controller to get all messages for a match_id
exports.getMessagesByMatchId = async (matchId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  try {
    // Get total message count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM message WHERE match_id = ?',
      [matchId]
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated messages with oldest first (typical chat history)
    const [rows] = await pool.query(
      'SELECT * FROM message WHERE match_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?',
      [matchId, limit, offset]
    );
    
    return {
      messages: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error retrieving messages:', error);
    throw new Error('Failed to retrieve messages: ' + error.message);
  }
};

// Controller to update the read status of messages
exports.markMessagesAsRead = async (matchId, userId) => {
  try {
    // Update read status for all unread messages sent to this user
    const [result] = await pool.query(
      `UPDATE message SET read_status = TRUE 
       WHERE match_id = ? AND sender_id != ? AND read_status = FALSE`,
      [matchId, userId]
    );
    
    // Clear match caches for both users
    const [matchData] = await pool.query('SELECT user_id_1, user_id_2 FROM `match` WHERE match_id = ?', [matchId]);
    
    if (matchData.length > 0) {
      const { user_id_1, user_id_2 } = matchData[0];
      deleteCachePattern(`mutual_matches_${user_id_1}`);
      deleteCachePattern(`mutual_matches_${user_id_2}`);
    }
    
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating message read status:', error);
    throw new Error('Failed to update message read status: ' + error.message);
  }
};