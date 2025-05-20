const express = require('express');
const Block = require('../models/block');

const router = express.Router();

// Create a new block
router.post('/blocks', async (req, res) => {
    try {
        const block = await Block.create(req.body);
        res.status(201).json(block);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create block' });
    }
});

// Get a block by ID
router.get('/blocks/:id', async (req, res) => {
    try {
        const block = await Block.readById(req.params.id);
        if (block) {
            res.json(block);
        } else {
            res.status(404).json({ error: 'Block not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve block' });
    }
});

// Get all blocks by a blocker ID
router.get('/blocks/blocker/:blocker_id', async (req, res) => {
    try {
        const blocks = await Block.getBlocksByBlockerId(req.params.blocker_id);
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve blocks' });
    }
});

// Delete a block
router.delete('/blocks/:id', async (req, res) => {
    try {
        const deleted = await Block.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Block not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete block' });
    }
});

module.exports = router;
