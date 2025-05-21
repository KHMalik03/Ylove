// api/controllers/profile.controller.js
const { pool } = require('../database');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../utils/cache');

// Create a new profile
exports.createProfile = async (profileData) => {
  const { user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility } = profileData;
  
  try {
    const [result] = await pool.query(
      `INSERT INTO profile (user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [user_id, name, university, field, bio, gender, gender_preference, profile_status || 'active', location_lat, location_long, last_location, visibility || true]
    );
    
    // Clear user profile cache
    deleteCachePattern(`user_profile_${user_id}`);
    
    const [rows] = await pool.query('SELECT * FROM profile WHERE profile_id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

// Read a profile by ID with caching
exports.getProfileById = async (profile_id) => {
  try {
    const cacheKey = `profile_${profile_id}`;
    let profile = getCache(cacheKey);
    
    if (!profile) {
      const [rows] = await pool.query('SELECT * FROM profile WHERE profile_id = ?;', [profile_id]);
      profile = rows[0];
      
      if (profile) {
        setCache(cacheKey, profile);
      }
    }
    
    return profile;
  } catch (error) {
    console.error('Error finding profile by ID:', error);
    throw error;
  }
};

// Get profile by user ID with caching
exports.getProfileByUserId = async (user_id) => {
  try {
    const cacheKey = `profile_user_${user_id}`;
    let profile = getCache(cacheKey);
    
    if (!profile) {
      const [rows] = await pool.query('SELECT * FROM profile WHERE user_id = ?;', [user_id]);
      profile = rows[0];
      
      if (profile) {
        setCache(cacheKey, profile);
      }
    }
    
    return profile;
  } catch (error) {
    console.error('Error finding profile by user ID:', error);
    throw error;
  }
};

// Update a profile
exports.updateProfile = async (profile_id, profileData) => {
  const { name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility } = profileData;
  
  try {
    const [profileResult] = await pool.query('SELECT * FROM profile WHERE profile_id = ?', [profile_id]);
    if (profileResult.length === 0) {
      return null;
    }
    
    const user_id = profileResult[0].user_id;
    
    await pool.query(
      `UPDATE profile
       SET name = ?, university = ?, field = ?, bio = ?, gender = ?, gender_preference = ?, 
           profile_status = ?, location_lat = ?, location_long = ?, last_location = ?, visibility = ?
       WHERE profile_id = ?;`,
      [name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility, profile_id]
    );
    
    // Clear caches
    deleteCache(`profile_${profile_id}`);
    deleteCache(`profile_user_${user_id}`);
    deleteCachePattern(`user_profile_${user_id}`);
    
    const [rows] = await pool.query('SELECT * FROM profile WHERE profile_id = ?', [profile_id]);
    return rows[0];
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Delete a profile
exports.deleteProfile = async (profile_id) => {
  try {
    const [profileResult] = await pool.query('SELECT * FROM profile WHERE profile_id = ?', [profile_id]);
    if (profileResult.length === 0) {
      return false;
    }
    
    const user_id = profileResult[0].user_id;
    
    await pool.query('DELETE FROM profile WHERE profile_id = ?;', [profile_id]);
    
    // Clear caches
    deleteCache(`profile_${profile_id}`);
    deleteCache(`profile_user_${user_id}`);
    deleteCachePattern(`user_profile_${user_id}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};