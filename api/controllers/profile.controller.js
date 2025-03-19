const { pool } = require('../database');
const Profile = require('../models/profile.model');

// Create a new profile
exports.CreateProfile = async (profileData) => {
    const { user_id, name, university, field, bio, gender, gender_preference, 
            profile_status, location_lat, location_long, last_location, visibility } = profileData;
    const created_at = new Date();

    const query = `
        INSERT INTO profile (
            user_id, name, university, field, bio, gender, gender_preference, 
            profile_status, location_lat, location_long, last_location, visibility, created_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
    `;

    const values = [
        user_id, name, university, field, bio, gender, gender_preference, 
        profile_status || 'active', location_lat, location_long, last_location, 
        visibility !== undefined ? visibility : true, created_at
    ];

    try {
        const result = await pool.query(query, values);
        return new Profile(...Object.values(result.rows[0]));
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

// Get a profile by ID
exports.ProfileFindById = async (profile_id) => {
    const query = 'SELECT * FROM profile WHERE profile_id = $1';
    const values = [profile_id];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...Object.values(result.rows[0]));
        }
        return null; // Profile not found
    } catch (error) {
        console.error('Error finding profile by ID:', error);
        throw error;
    }
};

// Update a profile
exports.ProfileUpdate = async (profile_id, profileData) => {
    const { user_id, name, university, field, bio, gender, gender_preference, 
            profile_status, location_lat, location_long, last_location, visibility } = profileData;
    const updated_at = new Date();

    const query = `
        UPDATE profile
        SET user_id = COALESCE($1, user_id),
            name = COALESCE($2, name),
            university = COALESCE($3, university),
            field = COALESCE($4, field),
            bio = COALESCE($5, bio),
            gender = COALESCE($6, gender),
            gender_preference = COALESCE($7, gender_preference),
            profile_status = COALESCE($8, profile_status),
            location_lat = COALESCE($9, location_lat),
            location_long = COALESCE($10, location_long),
            last_location = COALESCE($11, last_location),
            visibility = COALESCE($12, visibility),
        WHERE profile_id = $14
        RETURNING *
    `;

    const values = [
        user_id, name, university, field, bio, gender, gender_preference, 
        profile_status, location_lat, location_long, last_location, visibility, 
        updated_at, profile_id
    ];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...Object.values(result.rows[0]));
        }
        return null; // Profile not found
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Delete a user
exports.ProfileDelete = async (profile_id) => {
    const query = 'DELETE FROM profile WHERE profile_id = $1 RETURNING *';
    const values = [profile_id];

    try {
        const result = await pool.query(query, values);
        return result.rowCount > 0; // Returns true if a profile was deleted
    } catch (error) {
        console.error('Error deleting profile:', error);
        throw error; // Rethrow the error for further handling
    }
};

exports.UpdateProfileLocation = async (profile_id, lat, long) => {
    const last_location = new Date();
    const query = `
        UPDATE profile
        SET location_lat = $1,
            location_long = $2,
            last_location = $3
        WHERE profile_id = $4
        RETURNING *
    `;
    
    const values = [lat, long, last_location, profile_id];
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...Object.values(result.rows[0]));
        }
        return null;
    } catch (error) {
        console.error('Error updating profile location:', error);
        throw error;
    }
};

/**
 * Toggle a profile's visibility status
 * @param {number} profile_id - The ID of the profile to update
 * @returns {Object|null} Updated profile or null if not found
 */
exports.ToggleProfileVisibility = async (profile_id) => {
    const query = `
        UPDATE profile
        SET visibility = NOT visibility
        WHERE profile_id = $1
        RETURNING *
    `;

    const values = [profile_id];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...Object.values(result.rows[0]));
        }
        return null;
    } catch (error) {
        console.error('Error toggling profile visibility:', error);
        throw error;
    }
};
exports.ToggleProfileVisibility = async (profile_id) => {
    const query = `
        UPDATE profile
        SET visibility = NOT visibility
        WHERE profile_id = $1
        RETURNING *
    `;
    
    const values = [profile_id];
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Profile(...Object.values(result.rows[0]));
        }
        return null;
    } catch (error) {
        console.error('Error toggling profile visibility:', error);
        throw error;
    }
};

