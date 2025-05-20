const { pool } = require('../database');
const Photo = require('../models/photo.model'); // Import the Photo model

// Create a new photo
exports.CreatePhoto = async (photoData) => {
    const { user_id, img_URL, is_profile_picture, display_order } = photoData;
    try {
        const [result] = await pool.query(
            'INSERT INTO photo (user_id, img_URL, is_profile_picture, display_order) VALUES (?, ?, ?, ?)',
            [user_id, img_URL, is_profile_picture || false, display_order || 0]
        );
        
        const [rows] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating photo:', error);
        throw error;
    }
};

// Read a photo by ID
exports.PhotoFindById = async (photo_id) => {
    try {
        const [rows] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [photo_id]);
        return rows[0];
    } catch (error) {
        console.error('Error finding photo by ID:', error);
        throw error;
    }
};

// Get all photos for a user
exports.GetUserPhotos = async (user_id) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM photo WHERE user_id = ? ORDER BY display_order ASC',
            [user_id]
        );
        return rows;
    } catch (error) {
        console.error('Error getting user photos:', error);
        throw error;
    }
};

// Get profile picture for a user
exports.GetUserProfilePicture = async (user_id) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM photo WHERE user_id = ? AND is_profile_picture = true',
            [user_id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error getting profile picture:', error);
        throw error;
    }
};

// Update a photo
exports.PhotoUpdate = async (photo_id, photoData) => {
    const { img_URL, is_profile_picture, display_order } = photoData;
    try {
        const [result] = await pool.query(
            'UPDATE photo SET img_URL = ?, is_profile_picture = ?, display_order = ? WHERE photo_id = ?',
            [img_URL, is_profile_picture, display_order, photo_id]
        );
        
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [photo_id]);
            return rows[0];
        }
        return null;
    } catch (error) {
        console.error('Error updating photo:', error);
        throw error;
    }
};

// Set photo as profile picture and unset others
exports.SetAsProfilePicture = async (photo_id, user_id) => {
    try {
        // First, unset all profile pictures for this user
        await pool.query(
            'UPDATE photo SET is_profile_picture = false WHERE user_id = ?',
            [user_id]
        );
        
        // Then set the specified photo as profile picture
        const [result] = await pool.query(
            'UPDATE photo SET is_profile_picture = true WHERE photo_id = ? AND user_id = ?',
            [photo_id, user_id]
        );
        
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [photo_id]);
            return rows[0];
        }
        return null;
    } catch (error) {
        console.error('Error setting profile picture:', error);
        throw error;
    }
};

// Delete a photo
exports.PhotoDelete = async (photo_id) => {
    try {
        const [result] = await pool.query('DELETE FROM photo WHERE photo_id = ?', [photo_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};

// Reorder user photos
exports.ReorderPhotos = async (user_id, photoOrders) => {
    try {
        for (const item of photoOrders) {
            await pool.query(
                'UPDATE photo SET display_order = ? WHERE photo_id = ? AND user_id = ?',
                [item.display_order, item.photo_id, user_id]
            );
        }
        
        // Return updated photo list
        const [rows] = await pool.query(
            'SELECT * FROM photo WHERE user_id = ? ORDER BY display_order ASC',
            [user_id]
        );
        return rows;
    } catch (error) {
        console.error('Error reordering photos:', error);
        throw error;
    }
};