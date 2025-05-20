const { pool } = require('../database');

// Create a new profile
exports.createProfile = async (profileData) => {
    const { user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility } = profileData;
    const query = `
        INSERT INTO profiles (user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
    `;
    const values = [user_id, name, university, field, bio, gender, gender_preference, profile_status || 'active', location_lat, location_long, last_location, visibility || true];
    
    try {
        const result = await pool.query(query, values);
        return new Profile(...result.rows[0]);
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

// Read a profile by ID
exports.getProfileById = async (profile_id) => {
    const query = 'SELECT * FROM profiles WHERE profile_id = $1;';
    const values = [profile_id];
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...result.rows[0]);
        }
        return null;
    } catch (error) {
        console.error('Error finding profile by ID:', error);
        throw error;
    }
};

// Update a profile
exports.updateProfile = async (profile_id, profileData) => {
    const { name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility } = profileData;
    const query = `
        UPDATE profiles
        SET name = $1, university = $2, field = $3, bio = $4, gender = $5, gender_preference = $6, profile_status = $7, location_lat = $8, location_long = $9, last_location = $10, visibility = $11
        WHERE profile_id = $12 RETURNING *;
    `;
    const values = [name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility, profile_id];
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...result.rows[0]);
        }
        return null;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Delete a profile
exports.deleteProfile = async (profile_id) => {
    const query = 'DELETE FROM profiles WHERE profile_id = $1 RETURNING *;';
    const values = [profile_id];
    
    try {
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
};
