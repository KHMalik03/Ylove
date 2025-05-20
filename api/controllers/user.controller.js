const { pool } = require('../database');

// Create a new user
exports.CreateUser = async (userData) => {
    const { phone_number, password_hash, date_of_birth } = userData;
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as MySQL datetime

    const query = `
        INSERT INTO user (phone_number, password_hash, date_of_birth, created_at)
        VALUES (?, ?, ?, ?);
        `;    

    const values = [phone_number, password_hash, date_of_birth, created_at];

    try {
        // Log the query and values for debugging
        console.log('SQL Query:', query);
        console.log('Values:', values);
        
        const [result] = await pool.query(query, values);
        
        const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Read a user by ID
exports.UserFindById = async (user_id) => {
    try {
        const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        return rows[0];
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
};

// Update a user
exports.UserUpdate = async (user_id, userData) => {
    const { phone_number, password_hash, date_of_birth, account_status, verification_status } = userData;
    const last_login = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as MySQL datetime

    const query = `
            UPDATE user
            SET phone_number = ?, password_hash = ?, date_of_birth = ?,
                account_status = ?, verification_status = ?, last_login = ?
            WHERE user_id = ?;
        `;
  
    const values = [phone_number, password_hash, date_of_birth, account_status, verification_status, last_login, user_id];

    try {
        await pool.query(query, values);

        const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        return rows[0];
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Delete a user
exports.UserDelete = async (user_id) => {
    const query = 'DELETE FROM user WHERE user_id = ?;';

    try {
        const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        if (rows.length === 0) {
            return false; // User not found
        }        

        await pool.query(query, [user_id]);
        return true; // Successfully deleted
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};