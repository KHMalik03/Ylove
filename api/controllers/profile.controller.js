const { pool } = require('../database');

// Create a new profile
exports.createProfile = async (profileData) => {
    const { user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility } = profileData;
    const query = `
        INSERT INTO profile (user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ;
    `;
    const values = [user_id, name, university, field, bio, gender, gender_preference, profile_status || 'active', location_lat, location_long, last_location, visibility || true];
    
    try {
        const [result] = await pool.query(query, values);
        
        // Récupérer et retourner le profil créé
        const [rows] = await pool.query('SELECT * FROM profile WHERE profile_id = ?', [result.insertId]);
        return rows[0];  // Retourner directement les données, pas de nouvelle instance
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

// Read a profile by ID
exports.getProfileById = async (profile_id) => {
    const query = 'SELECT * FROM profile WHERE profile_id = ?;';
    
    try {
        const [rows] = await pool.query(query, [profile_id]);
        return rows[0];  // Retourner directement les données, pas de nouvelle instance
    } catch (error) {
        console.error('Error finding profile by ID:', error);
        throw error;
    }
};

// Update a profile
exports.updateProfile = async (profile_id, profileData) => {
    const { name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility } = profileData;
    const query = `
        UPDATE profile
        SET name = ?, university = ?, field = ?, bio = ?, gender = ?, gender_preference = ?, 
            profile_status = ?, location_lat = ?, location_long = ?, last_location = ?, visibility = ?
        WHERE profile_id = ? ;
    `;
    const values = [name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility, profile_id];
    
    try {
        await pool.query(query, values);
        
        const [rows] = await pool.query('SELECT * FROM profile WHERE profile_id = ?', [profile_id]);
        return rows[0];  // Retourner directement les données, pas de nouvelle instance
       
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Delete a profile
exports.deleteProfile = async (profile_id) => {
    const query = 'DELETE FROM profile WHERE profile_id = ? ;';
    
    try {
        const [result] = await pool.query(query, [profile_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
};