const { pool } = require('../database');
const UserInterest = require('./UserInterest'); // Assuming UserInterest is in the same directory

// Create a new user interest
exports.createUserInterest = async (user_id, interest_id) => {
    const created_at = new Date();
    const userInterest = new UserInterest(user_id, interest_id, created_at);

    const query = 'INSERT INTO User_Interest (user_id, interest_id, created_at) VALUES (?, ?, ?)';
    const values = [userInterest.user_id, userInterest.interest_id, userInterest.created_at];

    try {
        const [result] = await pool.execute(query, values);
        return { success: true, userInterestId: result.insertId };
    } catch (error) {
        console.error('Error creating user interest:', error);
        return { success: false, error: error.message };
    }
};

// Retrieve user interests by user_id
exports.getUserInterests = async (user_id) => {
    const query = 'SELECT * FROM User_Interest WHERE user_id = ?';
    try {
        const [results] = await pool.execute(query, [user_id]);
        return { success: true, interests: results };
    } catch (error) {
        console.error('Error retrieving user interests:', error);
        return { success: false, error: error.message };
    }
};

// Delete a user interest
exports.deleteUserInterest = async (user_id, interest_id) => {
    const query = 'DELETE FROM User_Interest WHERE user_id = ? AND interest_id = ?';
    try {
        const [result] = await pool.execute(query, [user_id, interest_id]);
        if (result.affectedRows > 0) {
            return { success: true };
        } else {
            return { success: false, message: 'User interest not found' };
        }
    } catch (error) {
        console.error('Error deleting user interest:', error);
        return { success: false, error: error.message };
    }
};