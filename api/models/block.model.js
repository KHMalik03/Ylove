const { pool } = require('../database');

class Block {

    block_id;
    blocker_id;
    blocked_id;
    timestamp;

    //Block class properties
    constructor(block_id, blocker_id, blocked_id, timestamp) {
        this.block_id = block_id;
        this.blocker_id = blocker_id;
        this.blocked_id = blocked_id;
        this.timestamp = timestamp || new Date();
    }

    // Add methods for CRUD operations hereS
}

module.exports = Block;