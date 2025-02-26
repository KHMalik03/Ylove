const { pool } = require('../database');

class Photo {
    constructor(photo_id, user_id, img_URL, is_profile_picture, display_order) {
        this.photo_id = photo_id;
        this.user_id = user_id;
        this.img_URL = img_URL;
        this.is_profile_picture = is_profile_picture || false;
        this.display_order = display_order;
    }

    // Add methods for CRUD operations here
}

module.exports = Photo;