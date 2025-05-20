const { pool } = require('../database');

// Controller to create a new swipe
exports.createSwipe = async (swipeData) => {
    const { swiper_id, swiped_id, direction } = swipeData;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        // Vérifier si les utilisateurs existent
        const [usersExist] = await pool.query(
            'SELECT COUNT(*) as count FROM user WHERE user_id IN (?, ?)',
            [swiper_id, swiped_id]
        );
        
        if (usersExist[0].count < 2) {
            throw new Error('One or both users do not exist');
        }
        
        const [result] = await pool.query(
            'INSERT INTO swipe (swiper_id, swiped_id, direction, timestamp) VALUES (?, ?, ?, ?)',
            [swiper_id, swiped_id, direction, timestamp]
        );
        
        const [rows] = await pool.query('SELECT * FROM swipe WHERE swipe_id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating swipe:', error);
        throw new Error('Failed to create swipe: ' + error.message);
    }
};

// Controller to get a swipe by ID
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

// Controller to get all swipes by a swiped_id (to see who swiped on a user)
exports.getSwipesBySwipedId = async (swipedId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM swipe WHERE swiped_id = ?', [swipedId]);
        return rows;
    } catch (error) {
        console.error('Error retrieving swipes by swiped user:', error);
        throw new Error('Failed to retrieve swipes: ' + error.message);
    }
};

// Controller to delete a swipe
exports.deleteSwipe = async (swipeId) => {
    try {
        const [result] = await pool.query('DELETE FROM swipe WHERE swipe_id = ?', [swipeId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting swipe:', error);
        throw new Error('Failed to delete swipe: ' + error.message);
    }
};