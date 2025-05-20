const { pool } = require('../database');

// Controller to create a new block
exports.createBlock = async (blockData) => {
    const { blocker_id, blocked_id } = blockData;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format pour MySQL

    try {
        console.log('Creating block with data:', { blocker_id, blocked_id, timestamp });
        
        const [result] = await pool.query(
            'INSERT INTO block (blocker_id, blocked_id, timestamp) VALUES (?, ?, ?)',
            [blocker_id, blocked_id, timestamp]
        );
        
        // Récupération du bloc inséré
        const [rows] = await pool.query('SELECT * FROM block WHERE block_id = ?', [result.insertId]);
        return rows[0]; // Le premier élément du tableau rows
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to create block: ' + error.message);
    }
};

// Controller to get a block by ID
exports.getBlockById = async (blockId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM block WHERE block_id = ?', [blockId]);
        return rows[0]; // Le premier élément ou undefined si vide
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to retrieve block: ' + error.message);
    }
};

// Controller to get all blocks by a blocker_id
exports.getBlocksByBlockerId = async (blockerId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM block WHERE blocker_id = ?', [blockerId]);
        return rows; // Tous les résultats
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to retrieve blocks: ' + error.message);
    }
};

// Controller to delete a block
exports.deleteBlock = async (blockId) => {
    try {
        const [result] = await pool.query('DELETE FROM block WHERE block_id = ?', [blockId]);
        return result.affectedRows > 0; // true si au moins une ligne a été supprimée
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to delete block: ' + error.message);
    }
};