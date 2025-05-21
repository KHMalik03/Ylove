// api/controllers/user.controller.js
const { pool } = require('../database');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../utils/cache');

// Create a new user
exports.CreateUser = async (userData) => {
  const { phone_number, password_hash, date_of_birth } = userData;
  const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const [result] = await pool.query(
      `INSERT INTO user (phone_number, password_hash, date_of_birth, created_at)
       VALUES (?, ?, ?, ?);`,
      [phone_number, password_hash, date_of_birth, created_at]
    );
    
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Read a user by ID with caching
exports.UserFindById = async (user_id) => {
  try {
    const cacheKey = `user_${user_id}`;
    let user = getCache(cacheKey);
    
    if (!user) {
      const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
      user = rows[0];
      
      if (user) {
        setCache(cacheKey, user);
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

// Update a user
exports.UserUpdate = async (user_id, userData) => {
  const { phone_number, password_hash, date_of_birth, account_status, verification_status } = userData;
  const last_login = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    await pool.query(
      `UPDATE user
       SET phone_number = ?, password_hash = ?, date_of_birth = ?,
           account_status = ?, verification_status = ?, last_login = ?
       WHERE user_id = ?;`,
      [phone_number, password_hash, date_of_birth, account_status, verification_status, last_login, user_id]
    );

    // Clear user cache
    deleteCache(`user_${user_id}`);
    
    // Clear related caches
    deleteCachePattern(`user_profile_${user_id}`);
    
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
    return rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
exports.UserDelete = async (user_id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
    if (rows.length === 0) {
      return false;
    }

    await pool.query('DELETE FROM user WHERE user_id = ?;', [user_id]);
    
    // Clear all related caches
    deleteCachePattern(`user_${user_id}`);
    deleteCachePattern(`user_profile_${user_id}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};