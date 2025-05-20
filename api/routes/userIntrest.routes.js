const express = require('express');
const UserInterest = require('../models/UserInterest');

const router = express.Router();

// Add a new interest for a user
router.post('/', async (req, res) => {
    try {
        const { user_id, interest_id } = req.body;
        
        if (!user_id || !interest_id) {
            return res.status(400).json({ message: 'User ID and interest ID are required' });
        }
        
        const userInterest = await UserInterest.create(user_id, interest_id);
        res.status(201).json(userInterest);
    } catch (error) {
        res.status(500).json({ message: 'Error adding user interest', error: error.message });
    }
});

// Get all interests for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const interests = await UserInterest.read(userId);
        
        res.status(200).json(interests);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user interests', error: error.message });
    }
});

// Delete a specific interest for a user
router.delete('/:userId/:interestId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const interestId = req.params.interestId;
        
        const result = await UserInterest.delete(userId, interestId);
        
        if (result) {
            res.status(200).json({ message: 'User interest deleted successfully' });
        } else {
            res.status(404).json({ message: 'User interest not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user interest', error: error.message });
    }
});

// Batch add multiple interests for a user
router.post('/batch', async (req, res) => {
    try {
        const { user_id, interest_ids } = req.body;
        
        if (!user_id || !Array.isArray(interest_ids)) {
            return res.status(400).json({ 
                message: 'User ID and interest_ids array are required' 
            });
        }
        
        const results = [];
        
        for (const interest_id of interest_ids) {
            const userInterest = await UserInterest.create(user_id, interest_id);
            results.push(userInterest);
        }
        
        res.status(201).json(results);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding batch user interests', 
            error: error.message 
        });
    }
});

// Replace all interests for a user (delete existing ones and add new ones)
router.put('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { interest_ids } = req.body;
        
        if (!Array.isArray(interest_ids)) {
            return res.status(400).json({ 
                message: 'interest_ids array is required' 
            });
        }
        
        // Get existing interests for comparison
        const existingInterests = await UserInterest.read(userId);
        const existingInterestIds = existingInterests.map(interest => interest.interest_id);
        
        // Find interests to delete (existing but not in new list)
        for (const existingId of existingInterestIds) {
            if (!interest_ids.includes(existingId)) {
                await UserInterest.delete(userId, existingId);
            }
        }
        
        // Find interests to add (in new list but not existing)
        const results = [];
        for (const newId of interest_ids) {
            if (!existingInterestIds.includes(newId)) {
                const userInterest = await UserInterest.create(userId, newId);
                results.push(userInterest);
            }
        }
        
        // Get updated interests
        const updatedInterests = await UserInterest.read(userId);
        res.status(200).json(updatedInterests);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating user interests', 
            error: error.message 
        });
    }
});

module.exports = router;