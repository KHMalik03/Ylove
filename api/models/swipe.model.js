const { pool } = require('../database');

class Swipe {
    constructor(swipe_id, swiper_id, swiped_id, direction, timestamp) {
        this.swipe_id = swipe_id;
        this.swiper_id = swiper_id;
        this.swiped_id = swiped_id;
        this.direction = direction; // TRUE for right (like), FALSE for left (dislike)
        this.timestamp = timestamp || new Date();
    }

    // Add methods for CRUD operations here
}

module.exports = Swipe;