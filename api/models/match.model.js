const { pool } = require('../database');

class Match {
    constructor(match_id, user_id_1, user_id_2, created_at, is_active) {
        this.match_id = match_id;
        this.user_id_1 = user_id_1;
        this.user_id_2 = user_id_2;
        this.created_at = created_at || new Date();
        this.is_active = is_active || true;
    }

    // Add methods for CRUD operations here
}

module.exports = Match;