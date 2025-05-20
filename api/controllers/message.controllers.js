const { pool } = require('../database');

// Controller to create a new message
exports.createMessage = async (messageData) => {
    const { match_id, sender_id, content, timestamp, read_status } = messageData;

    try {
        const result = await pool.query(
            'INSERT INTO messages (match_id, sender_id, content, timestamp, read_status) VALUES (?, ?, ?, ?, ?) ',
            [match_id, sender_id, content, timestamp, read_status]
        );
        return result.rows[0]; // Return the created message record
    } catch (error) {
        throw new Error('Failed to create message: ' + error.message);
    }
};

// Controller to get a message by ID
exports.getMessageById = async (messageId) => {
    try {
        const result = await pool.query('SELECT * FROM messages WHERE message_id = ?', [messageId]);
        return result.rows[0]; // Return the message or null if not found
    } catch (error) {
        throw new Error('Failed to retrieve message: ' + error.message);
    }
};

// Controller to get all messages for a match_id
exports.getMessagesByMatchId = async (matchId) => {
    try {
        const result = await pool.query('SELECT * FROM messages WHERE match_id = ? ORDER BY timestamp ASC', [matchId]);
        return result.rows; // Return all messages related to the match
    } catch (error) {
        throw new Error('Failed to retrieve messages: ' + error.message);
    }
};

// Controller to update the read status of a message
exports.updateMessageReadStatus = async (messageId, readStatus) => {
    try {
        const result = await pool.query(
            'UPDATE messages SET read_status = ? WHERE message_id = ? ',
            [readStatus, messageId]
        );
        return result.rows[0]; // Return the updated message
    } catch (error) {
        throw new Error('Failed to update message read status: ' + error.message);
    }
};

// Controller to delete a message
exports.deleteMessage = async (messageId) => {
    try {
        const result = await pool.query(
            'DELETE FROM messages WHERE message_id = ? ',
            [messageId]
        );
        return result.rowCount > 0; // Return true if a row was deleted
    } catch (error) {
        throw new Error('Failed to delete message: ' + error.message);
    }
};

