const { pool } = require('../database');

class Interest {
    constructor(interest_id, name, category) {
        this.interest_id = interest_id;
        this.name = name;
        this.category = category;
    }

    // Add methods for CRUD operations here
}

module.exports = Interest;