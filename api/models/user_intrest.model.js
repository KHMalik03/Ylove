const UserIntrestController = require('../controllers/user_intrest.controller.js');

class UserInterest {
    user_id;
    interest_id;
    created_at;

    //UserInterest class constructor
    constructor(user_id, interest_id, created_at) {
        this.user_id = user_id;
        this.interest_id = interest_id;
        this.created_at = created_at || new Date();
    }

    // Create a new user interest
    static async create(user_id, interest_id) {
        return await UserIntrestController.createUserInterest(user_id, interest_id);
}

    // Read user interests by user_id
    static async read(user_id) {
        return await UserIntrestController.getUserInterests(user_id);
    }

    // Delete a user interest
    static async delete(user_id, interest_id) {
        return await UserIntrestController.deleteUserInterest(user_id, interest_id);
    }

}

module.exports = UserInterest;