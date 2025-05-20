const { pool } = require('../database');

// Controller to create a new swipe
exports.createSwipe = async (swipeData) => {
    const { swiper_id, swiped_id, direction, timestamp } = swipeData;

    try {
        const result = await pool.query(
            'INSERT INTO swipes (swiper_id, swiped_id, direction, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
            [swiper_id, swiped_id, direction, timestamp]
        );
        return result.rows[0]; // Return the created swipe record
    } catch (error) {
        throw new Error('Failed to create swipe: ' + error.message);
    }
};

// Controller to get a swipe by ID
exports.getSwipeById = async (swipeId) => {
    try {
        const result = await pool.query('SELECT * FROM swipes WHERE swipe_id = $1', [swipeId]);
        return result.rows[0]; // Return the swipe or null if not found
    } catch (error) {
        throw new Error('Failed to retrieve swipe: ' + error.message);
    }
};

// Controller to get all swipes by a swiper_id
exports.getSwipesBySwiperId = async (swiperId) => {
    try {
        const result = await pool.query('SELECT * FROM swipes WHERE swiper_id = $1', [swiperId]);
        return result.rows; // Return all swipes related to the swiper
    } catch (error) {
        throw new Error('Failed to retrieve swipes: ' + error.message);
    }
};

// Controller to get all swipes by a swiped_id (to see who swiped on a user)
exports.getSwipesBySwipedId = async (swipedId) => {
    try {
        const result = await pool.query('SELECT * FROM swipes WHERE swiped_id = $1', [swipedId]);
        return result.rows; // Return all swipes on the user
    } catch (error) {
        throw new Error('Failed to retrieve swipes: ' + error.message);
    }
};

// Controller to delete a swipe
exports.deleteSwipe = async (swipeId) => {
    try {
        const result = await pool.query(
            'DELETE FROM swipes WHERE swipe_id = $1 RETURNING *',
            [swipeId]
        );
        return result.rowCount > 0; // Return true if a row was deleted
    } catch (error) {
        throw new Error('Failed to delete swipe: ' + error.message);
    }
};


