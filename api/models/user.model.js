const { pool } = require('../database');
const userController = require('../controllers/user.controller');

class User {
    constructor(user_id, phone_number, password_hash, date_of_birth, created_at, last_login, account_status, verification_status) {
        this.user_id = user_id;
        this.phone_number = phone_number;
        this.password_hash = password_hash;
        this.date_of_birth = date_of_birth;
        this.created_at = created_at;
        this.last_login = last_login;
        this.account_status = account_status || 'active';
        this.verification_status = verification_status || false;
    }

    // Create a new user using the controller
    static async create(userData) {
        return await userController.CreateUser (userData);
    }

    // Read a user by ID using the controller
    static async findById(user_id) {
        return await userController.UserFindById(user_id);
    }

    // Update a user using the controller
    static async update(user_id, userData) {
        return await userController.UserUpdate(user_id, userData);
    }

    // Delete a user using the controller
    static async delete(user_id) {
        return await userController.UserDelete(user_id);
    }
}

module.exports = User;