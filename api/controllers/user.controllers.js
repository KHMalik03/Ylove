const { pool } = require('../database');
const User = require('../models/user.model');

// Create a new user
exports.CreateUser  = async (userData) => {
    const { phone_number, password_hash, date_of_birth } = userData;
    const created_at = new Date();

    const query = `
        INSERT INTO users (phone_number, password_hash, date_of_birth, created_at)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;

    const values = [phone_number, password_hash, date_of_birth, created_at];

    try {
        const result = await pool.query(query, values);
        return new User(...result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error; // Rethrow the error for further handling
    }
};

// Read a user by ID
exports.UserFindById = async (user_id) => {
    const query = 'SELECT * FROM users WHERE user_id = $1;';
    const values = [user_id];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new User(...result.rows[0]);
        }
        return null; // User not found
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error; // Rethrow the error for further handling
    }
};

// Update a user
exports.UserUpdate = async (user_id, userData) => {
    const { phone_number, password_hash, date_of_birth, account_status, verification_status } = userData;
    const last_login = new Date();

    const query = `
        UPDATE users
        SET phone_number = $1, password_hash = $2, date_of_birth = $3, 
            account_status = $4, verification_status = $5, last_login = $6
        WHERE user_id = $7 RETURNING *;
    `;

    const values = [phone_number, password_hash, date_of_birth, account_status, verification_status, last_login, user_id];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new User(...result.rows[0]);
        }
        return null; // User not found
    } catch (error) {
        console.error('Error updating user:', error);
        throw error; // Rethrow the error for further handling
    }
};

// Delete a user
exports.UserDelete = async (user_id) => {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *;';
    const values = [user_id];

    try {
        const result = await pool.query(query, values);
        return result.rowCount > 0; // Returns true if a user was deleted
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error; // Rethrow the error for further handling
    }
};

//test