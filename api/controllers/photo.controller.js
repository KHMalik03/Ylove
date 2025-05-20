const { pool } = require('../database');

// Create a new photo
exports.CreatePhoto = async (photoData) => {
    const { user_id, img_URL, is_profile_picture, display_order } = photoData;
    const query = `
        INSERT INTO photos (user_id, img_URL, is_profile_picture, display_order)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [user_id, img_URL, is_profile_picture || false, display_order || 0];
    try {
        const result = await pool.query(query, values);
        return new Photo(
            result.rows[0].photo_id,
            result.rows[0].user_id,
            result.rows[0].img_URL,
            result.rows[0].is_profile_picture,
            result.rows[0].display_order
        );
    } catch (error) {
        console.error('Error creating photo:', error);
        throw error;
    }
};

// Read a photo by ID
exports.PhotoFindById = async (photo_id) => {
    const query = 'SELECT * FROM photos WHERE photo_id = $1;';
    const values = [photo_id];
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Photo(
                result.rows[0].photo_id,
                result.rows[0].user_id,
                result.rows[0].img_URL,
                result.rows[0].is_profile_picture,
                result.rows[0].display_order
            );
        }
        return null; // Photo not found
    } catch (error) {
        console.error('Error finding photo by ID:', error);
        throw error;
    }
};

// Get all photos for a user
exports.GetUserPhotos = async (user_id) => {
    const query = 'SELECT * FROM photos WHERE user_id = $1 ORDER BY display_order ASC;';
    const values = [user_id];
    try {
        const result = await pool.query(query, values);
        return result.rows.map(row => new Photo(
            row.photo_id,
            row.user_id,
            row.img_URL,
            row.is_profile_picture,
            row.display_order
        ));
    } catch (error) {
        console.error('Error getting user photos:', error);
        throw error;
    }
};

// Get profile picture for a user
exports.GetUserProfilePicture = async (user_id) => {
    const query = 'SELECT * FROM photos WHERE user_id = $1 AND is_profile_picture = true;';
    const values = [user_id];
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Photo(
                result.rows[0].photo_id,
                result.rows[0].user_id,
                result.rows[0].img_URL,
                result.rows[0].is_profile_picture,
                result.rows[0].display_order
            );
        }
        return null; // Profile picture not found
    } catch (error) {
        console.error('Error getting profile picture:', error);
        throw error;
    }
};

// Update a photo
exports.PhotoUpdate = async (photo_id, photoData) => {
    const { img_URL, is_profile_picture, display_order } = photoData;
    const query = `
        UPDATE photos
        SET img_URL = $1, is_profile_picture = $2, display_order = $3
        WHERE photo_id = $4 RETURNING *;
    `;
    const values = [img_URL, is_profile_picture, display_order, photo_id];
    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return new Photo(
                result.rows[0].photo_id,
                result.rows[0].user_id,
                result.rows[0].img_URL,
                result.rows[0].is_profile_picture,
                result.rows[0].display_order
            );
        }
        return null; // Photo not found
    } catch (error) {
        console.error('Error updating photo:', error);
        throw error;
    }
};

// Set photo as profile picture and unset others
exports.SetAsProfilePicture = async (photo_id, user_id) => {
    try {
        // Start a transaction
        await pool.query('BEGIN');
        
        // First, unset all profile pictures for this user
        await pool.query(
            'UPDATE photos SET is_profile_picture = false WHERE user_id = $1',
            [user_id]
        );
        
        // Then set the specified photo as profile picture
        const query = `
            UPDATE photos
            SET is_profile_picture = true
            WHERE photo_id = $1 AND user_id = $2 RETURNING *;
        `;
        const result = await pool.query(query, [photo_id, user_id]);
        
        // Commit the transaction
        await pool.query('COMMIT');
        
        if (result.rows.length > 0) {
            return new Photo(
                result.rows[0].photo_id,
                result.rows[0].user_id,
                result.rows[0].img_URL,
                result.rows[0].is_profile_picture,
                result.rows[0].display_order
            );
        }
        return null; // Photo not found
    } catch (error) {
        // Rollback in case of error
        await pool.query('ROLLBACK');
        console.error('Error setting profile picture:', error);
        throw error;
    }
};

// Delete a photo
exports.PhotoDelete = async (photo_id) => {
    const query = 'DELETE FROM photos WHERE photo_id = $1 RETURNING *;';
    const values = [photo_id];
    try {
        const result = await pool.query(query, values);
        return result.rowCount > 0; // Returns true if a photo was deleted
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};

// Reorder user photos
exports.ReorderPhotos = async (user_id, photoOrders) => {
    try {
        // Start a transaction
        await pool.query('BEGIN');
        
        for (const item of photoOrders) {
            await pool.query(
                'UPDATE photos SET display_order = $1 WHERE photo_id = $2 AND user_id = $3',
                [item.display_order, item.photo_id, user_id]
            );
        }
        
        // Commit the transaction
        await pool.query('COMMIT');
        
        // Return updated photo list
        return await exports.GetUserPhotos(user_id);
    } catch (error) {
        // Rollback in case of error
        await pool.query('ROLLBACK');
        console.error('Error reordering photos:', error);
        throw error;
    }
};