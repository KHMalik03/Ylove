class Swipe {

    swipe_id;
    swiper_id;
    swiped_id;
    direction;
    timestamp;

    //Swipe class constructor
    constructor(swipe_id, swiper_id, swiped_id, direction, timestamp) {
        this.swipe_id = swipe_id;
        this.swiper_id = swiper_id;
        this.swiped_id = swiped_id;
        this.direction = direction; // TRUE for right (like), FALSE for left (dislike)
        this.timestamp = timestamp || new Date();
    }

    // Create a new swipe
    static async create(swiper_id, swiped_id, direction) {
        return await SwipeController.createSwipe(swiper_id, swiped_id, direction);
    }

    // Read a swipe by ID
    static async read(swipe_id) {
        return await SwipeController.getSwipeById(swipe_id);
    }

    // Get all swipes by swiper_id
    static async readAll(swiper_id) {
        return await SwipeController.getSwipesBySwiperId(swiper_id);
    }

    // Get all swipes by swiped_id
    static async readAllBySwipedId(swiped_id) {
        return await SwipeController.getSwipesBySwipedId(swiped_id);
    }

    // Delete a swipe
    static async delete(swipe_id) {
        return await SwipeController.deleteSwipe(swipe_id);
    }
}

module.exports = Swipe;