const { pool } = require('../database');

// Create a new match
exports.createMatch = async (matchData) => {
    const { user_id_1, user_id_2 } = matchData;
    const created_at = new Date();
    const is_active = true;
    
    const query = `
        INSERT INTO matches (user_id_1, user_id_2, created_at, is_active)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [user_id_1, user_id_2, created_at, is_active];
    
    try {
        const result = await pool.query(query, values);
        return new Match(
            result.rows[0].match_id,
            result.rows[0].user_id_1,
            result.rows[0].user_id_2,
            result.rows[0].created_at,
            result.rows[0].is_active
        );
    } catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
};

// Find a match by ID
exports.findMatchById = async (match_id) => {
    const query = 'SELECT * FROM matches WHERE match_id = $1;';
    const values = [match_id];
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Match(
                result.rows[0].match_id,
                result.rows[0].user_id_1,
                result.rows[0].user_id_2,
                result.rows[0].created_at,
                result.rows[0].is_active
            );
        }
        return null; // Match not found
    } catch (error) {
        console.error('Error finding match by ID:', error);
        throw error;
    }
};

// Get all matches for a user
exports.getUserMatches = async (user_id) => {
    const query = `
        SELECT * FROM matches 
        WHERE (user_id_1 = $1 OR user_id_2 = $1) AND is_active = true
        ORDER BY created_at DESC;
    `;
    const values = [user_id];
    
    try {
        const result = await pool.query(query, values);
        return result.rows.map(row => new Match(
            row.match_id,
            row.user_id_1,
            row.user_id_2,
            row.created_at,
            row.is_active
        ));
    } catch (error) {
        console.error('Error getting user matches:', error);
        throw error;
    }
};

// Check if a match exists between two users
exports.checkMatchExists = async (user_id_1, user_id_2) => {
    const query = `
        SELECT * FROM matches 
        WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1);
    `;
    const values = [user_id_1, user_id_2];
    
    try {
        const result = await pool.query(query, values);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking if match exists:', error);
        throw error;
    }
};

// Update match status (activate/deactivate)
exports.updateMatchStatus = async (match_id, is_active) => {
    const query = `
        UPDATE matches
        SET is_active = $1
        WHERE match_id = $2 RETURNING *;
    `;
    const values = [is_active, match_id];
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Match(
                result.rows[0].match_id,
                result.rows[0].user_id_1,
                result.rows[0].user_id_2,
                result.rows[0].created_at,
                result.rows[0].is_active
            );
        }
        return null; // Match not found
    } catch (error) {
        console.error('Error updating match status:', error);
        throw error;
    }
};

// Delete a match
exports.deleteMatch = async (match_id) => {
    const query = 'DELETE FROM matches WHERE match_id = $1 RETURNING *;';
    const values = [match_id];
    
    try {
        const result = await pool.query(query, values);
        return result.rowCount > 0; // Returns true if a match was deleted
    } catch (error) {
        console.error('Error deleting match:', error);
        throw error;
    }
};

// Get match count for a user
exports.getMatchCount = async (user_id) => {
    const query = `
        SELECT COUNT(*) as match_count 
        FROM matches 
        WHERE (user_id_1 = $1 OR user_id_2 = $1) AND is_active = true;
    `;
    const values = [user_id];
    
    try {
        const result = await pool.query(query, values);
        return parseInt(result.rows[0].match_count);
    } catch (error) {
        console.error('Error getting match count:', error);
        throw error;
    }
};