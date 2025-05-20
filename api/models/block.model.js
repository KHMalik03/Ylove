const BlockController = require('../controllers/block.controller.js');

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

    // Create a new block - CORRECTION ICI
    static async create(blockData) {
        return await BlockController.createBlock(blockData);
    }

    // Read a block by ID
    static async readById(block_id) {
        return await BlockController.getBlockById(block_id);
    }

    // Get all blocks by a blocker ID
    static async getBlocksByBlockerId(blocker_id) {
        return await BlockController.getBlocksByBlockerId(blocker_id);
    }

    // Delete a block
    static async delete(block_id) {
        return await BlockController.deleteBlock(block_id);
    }
}

module.exports = Block;