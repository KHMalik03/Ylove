class User {

    user_id;
    phone_number;
    password_hash;
    date_of_birth;
    created_at;
    last_login;
    account_status;
    verification_status;

    // User class constructor
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
}

module.exports = User;