const matchController = require('../controllers/match.controllers.js');

class Match {

    match_id;
    user_id_1;
    user_id_2;
    created_at;
    is_active;

    //Match class constructor
    constructor(match_id, user_id_1, user_id_2, created_at, is_active) {
        this.match_id = match_id;
        this.user_id_1 = user_id_1;
        this.user_id_2 = user_id_2;
        this.created_at = created_at || new Date();
        this.is_active = is_active || true;
    }

    // Create a new match using the controller
    static async create(matchData) {
        return await matchController.createMatch(matchData);
    }

    // Read a match by ID using the controller
    static async read(match_id) {
        return await matchController.findMatchById(match_id);
    }

    // Geyt all matches for a user using the controller
    static async getUserMatches(user_id) {
        return await matchController.getUserMatches(user_id);
    }

    // Check if a match exists using the controller
    static async checkMatchExists(match_id) {
        return await matchController.checkMatchExists(match_id);
    }

    // Update a match status using the controller
    static async updateMatchStatus(match_id, status) {
        return await matchController.updateMatchStatus(match_id, status);
    }

    // Delete a match using the controller
    static async delete(match_id) {
        return await matchController.deleteMatch(match_id);
    }

    // Get match count for a user using the controller
    static async getMatchCount(user_id) {
        return await matchController.getMatchCount(user_id);
    }
}

module.exports = Match;