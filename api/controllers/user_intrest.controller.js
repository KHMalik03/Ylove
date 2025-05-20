const { pool } = require('../database');

// Create a new user interest
exports.createUserInterest = async (user_id, interest_id) => {
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = 'INSERT INTO user_interest (user_id, interest_id, created_at) VALUES (?, ?, ?)';
    const values = [user_id, interest_id, created_at];

    try {
        // Vérifier si l'utilisateur et l'intérêt existent
        const [userExists] = await pool.query('SELECT 1 FROM user WHERE user_id = ?', [user_id]);
        if (userExists.length === 0) {
            return { success: false, error: 'User does not exist' };
        }
        
        const [interestExists] = await pool.query('SELECT 1 FROM interest WHERE interest_id = ?', [interest_id]);
        if (interestExists.length === 0) {
            return { success: false, error: 'Interest does not exist' };
        }
        
        const [result] = await pool.query(query, values);
        
        return { 
            success: true, 
            user_interest: { 
                user_id: parseInt(user_id), 
                interest_id: parseInt(interest_id), 
                created_at 
            } 
        };
    } catch (error) {
        console.error('Error creating user interest:', error);
        return { success: false, error: error.message };
    }
};

// Retrieve user interests by user_id
exports.getUserInterests = async (user_id) => {
    try {
        // Vérifier d'abord si l'utilisateur existe
        const [userExists] = await pool.query('SELECT 1 FROM user WHERE user_id = ?', [user_id]);
        if (userExists.length === 0) {
            return { success: false, error: 'User does not exist' };
        }
        
        // Obtenir les intérêts avec les informations détaillées
        const [rows] = await pool.query(`
            SELECT ui.user_id, ui.interest_id, ui.created_at, i.name, i.category 
            FROM user_interest ui
            JOIN interest i ON ui.interest_id = i.interest_id
            WHERE ui.user_id = ?
        `, [user_id]);
        
        return { success: true, interests: rows };
    } catch (error) {
        console.error('Error retrieving user interests:', error);
        return { success: false, error: error.message };
    }
};

// Delete a user interest
exports.deleteUserInterest = async (user_id, interest_id) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM user_interest WHERE user_id = ? AND interest_id = ?',
            [user_id, interest_id]
        );
        
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