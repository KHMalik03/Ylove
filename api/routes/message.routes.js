const express = require('express');
const messageController = require('../controllers/message.controllers');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Get messages for a match
router.get('/match/:matchId', protect, async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Verify user is part of the match
    const [matchCheck] = await pool.query(
      'SELECT * FROM `match` WHERE match_id = ? AND (user_id_1 = ? OR user_id_2 = ?)',
      [matchId, req.user.user_id, req.user.user_id]
    );
    
    if (matchCheck.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to view these messages' });
    }
    
    const result = await messageController.getMessagesByMatchId(matchId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error in get messages route:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Send a new message
router.post('/', protect, async (req, res) => {
  try {
    const { match_id, content } = req.body;
    
    if (!match_id || !content) {
      return res.status(400).json({ error: 'Match ID and content are required' });
    }
    
    // Verify user is part of the match
    const [matchCheck] = await pool.query(
      'SELECT * FROM `match` WHERE match_id = ? AND (user_id_1 = ? OR user_id_2 = ?)',
      [match_id, req.user.user_id, req.user.user_id]
    );
    
    if (matchCheck.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to send messages in this match' });
    }
    
    const messageData = {
      match_id,
      sender_id: req.user.user_id,
      content
    };
    
    const message = await messageController.createMessage(messageData);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error in create message route:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/read/match/:matchId', protect, async (req, res) => {
  try {
    const matchId = req.params.matchId;
    
    // Verify user is part of the match
    const [matchCheck] = await pool.query(
      'SELECT * FROM `match` WHERE match_id = ? AND (user_id_1 = ? OR user_id_2 = ?)',
      [matchId, req.user.user_id, req.user.user_id]
    );
    
    if (matchCheck.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to mark messages in this match' });
    }
    
    const updatedCount = await messageController.markMessagesAsRead(matchId, req.user.user_id);
    res.json({ success: true, updatedCount });
  } catch (error) {
    console.error('Error in mark as read route:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;