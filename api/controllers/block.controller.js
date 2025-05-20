const { pool } = require('../database');

// Controller to create a new block
exports.createBlock = async (blockData) => {
    const { blocker_id, blocked_id, timestamp } = blockData;

    try {
        const result = await pool.query(
            'INSERT INTO blocks (blocker_id, blocked_id, timestamp) VALUES ($1, $2, $3) RETURNING *',
            [blocker_id, blocked_id, timestamp]
        );
        return result.rows[0]; // Return the created block record
    } catch (error) {
        throw new Error('Failed to create block: ' + error.message);
    }
};

// Controller to get a block by ID
exports.getBlockById = async (blockId) => {
    try {
        const result = await pool.query('SELECT * FROM blocks WHERE block_id = $1', [blockId]);
        return result.rows[0]; // Return the block or null if not found
    } catch (error) {
        throw new Error('Failed to retrieve block: ' + error.message);
    }
};

// Controller to get all blocks by a blocker_id
exports.getBlocksByBlockerId = async (blockerId) => {
    try {
        const result = await pool.query('SELECT * FROM blocks WHERE blocker_id = $1', [blockerId]);
        return result.rows; // Return all blocks related to the blocker
    } catch (error) {
        throw new Error('Failed to retrieve blocks: ' + error.message);
    }
};

// Controller to delete a block
exports.deleteBlock = async (blockId) => {
    try {
        const result = await pool.query(
            'DELETE FROM blocks WHERE block_id = $1 RETURNING *',
            [blockId]
        );
        return result.rowCount > 0; // Return true if a row was deleted
    } catch (error) {
        throw new Error('Failed to delete block: ' + error.message);
    }
};
