const { pool } = require('../database');

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

    // Add methods for CRUD operations here
}

module.exports = UserInterest;