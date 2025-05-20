const express = require('express');
const Message = require('../models/message');

const router = express.Router();

// Create a new message
router.post('/messages', async (req, res) => {
    try {
        const message = await Message.create(req.body);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Get a message by ID
router.get('/messages/:id', async (req, res) => {
    try {
        const message = await Message.readById(req.params.id);
        if (message) {
            res.json(message);
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve message' });
    }
});

// Get all messages for a match_id
router.get('/messages/match/:match_id', async (req, res) => {
    try {
        const messages = await Message.getMessagesByMatchId(req.params.match_id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

// Update the read status of a message
router.put('/messages/:id/read-status', async (req, res) => {
    try {
        const updatedMessage = await Message.updateMessageReadStatus(req.params.id, req.body.read_status);
        if (updatedMessage) {
            res.json(updatedMessage);
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message read status' });
    }
});

// Delete a message
router.delete('/messages/:id', async (req, res) => {
    try {
        const deleted = await Message.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
