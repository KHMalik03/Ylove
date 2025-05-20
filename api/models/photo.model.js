const photoController = require('../controllers/photo.controller.js');

class Photo {
    photo_id;
    user_id;
    img_URL;
    is_profile_picture;
    display_order;
    
    constructor(photo_id, user_id, img_URL, is_profile_picture, display_order) {
        this.photo_id = photo_id;
        this.user_id = user_id;
        this.img_URL = img_URL;
        this.is_profile_picture = is_profile_picture || false;
        this.display_order = display_order;
    }

    // Create a new photo using the controller
    static async create(photoData) {
        return await photoController.CreatePhoto(photoData);
    }

    // Read a photo by ID using the controller
    static async read(id) {
        return await photoController.PhotoFindById(id);
    }

    // Get all photos for a user using the controller
    static async getUserPhotos(user_id) {
        return await photoController.GetUserPhotos(user_id);
    }

    // Get profile picture for a user using the controller
    static async getProfilePicture(user_id) {
        return await photoController.GetUserProfilePicture(user_id);
    }

    // Update a photo using the controller
    static async update(photo_id, photoData) {
        return await photoController.PhotoUpdate(photo_id, photoData);
    }

    // Set a photo as profile picture using the controller
    static async setProfilePicture(photo_id, user_id) {
    return await photoController.SetAsProfilePicture(photo_id, user_id);
}

    // Delete a photo using the controller
    static async delete(photo_id) {
        return await photoController.PhotoDelete(photo_id);
    }

    // Reorder photos using the controller
    static async reorderPhotos(user_id, new_order) {
        return await photoController.ReorderPhotos(user_id, new_order);
    }
}

module.exports = Photo;