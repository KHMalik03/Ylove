const { pool } = require('../database');

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
        
        const [rows] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
};

// Find a match by ID
exports.findMatchById = async (match_id) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `match` WHERE match_id = ?', [match_id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding match by ID:', error);
        throw error;
    }
};

// Get all matches for a user
exports.getUserMatches = async (user_id) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM `match` WHERE (user_id_1 = ? OR user_id_2 = ?) AND is_active = true ORDER BY created_at DESC',
            [user_id, user_id]
        );
        return rows;
    } catch (error) {
        console.error('Error getting user matches:', error);
        throw error;
    }
};

// Update match status (activate/deactivate)
exports.updateMatchStatus = async (match_id, is_active) => {
    try {
        const [result] = await pool.query(
            'UPDATE `match` SET is_active = ? WHERE match_id = ?',
            [is_active, match_id]
        );
        
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
        const [result] = await pool.query('DELETE FROM `match` WHERE match_id = ?', [match_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting match:', error);
        throw error;
    }
};

// Get match count for a user
exports.getMatchCount = async (user_id) => {
    try {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as match_count FROM `match` WHERE (user_id_1 = ? OR user_id_2 = ?) AND is_active = true',
            [user_id, user_id]
        );
        return rows[0].match_count;
    } catch (error) {
        console.error('Error getting match count:', error);
        throw error;
    }
};