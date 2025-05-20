const express = require('express');
const UserInterest = require('../models/user_intrest.model.js'); 

const router = express.Router();

// Add a new interest for a user
router.post('/', async (req, res) => {
    try {
        console.log('Creating user interest with data:', req.body);
        const { user_id, interest_id } = req.body;
        
        if (!user_id || !interest_id) {
            return res.status(400).json({ message: 'User ID and interest ID are required' });
        }
        
        const result = await UserInterest.create(user_id, interest_id);
        console.log('Creation result:', result);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json({ message: result.error || 'Failed to create user interest' });
        }
    } catch (error) {
        console.error('Error in POST user interest route:', error);
        res.status(500).json({ message: 'Error adding user interest', error: error.message });
    }
});

// Get all interests for a specific user
router.get('/:userId', async (req, res) => {
    try {
        console.log('Getting interests for user:', req.params.userId);
        const userId = req.params.userId;
        const result = await UserInterest.read(userId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: result.error || 'No interests found' });
        }
    } catch (error) {
        console.error('Error in GET user interests route:', error);
        res.status(500).json({ message: 'Error retrieving user interests', error: error.message });
    }
});

// Delete a specific interest for a user
router.delete('/:userId/:interestId', async (req, res) => {
    try {
        console.log('Deleting interest', req.params.interestId, 'for user', req.params.userId);
        const userId = req.params.userId;
        const interestId = req.params.interestId;
        
        const result = await UserInterest.delete(userId, interestId);
        
        if (result.success) {
            res.status(200).json({ message: 'User interest deleted successfully' });
        } else {
            res.status(404).json({ message: result.message || 'User interest not found' });
        }
    } catch (error) {
        console.error('Error in DELETE user interest route:', error);
        res.status(500).json({ message: 'Error deleting user interest', error: error.message });
    }
});

// Batch add multiple interests for a user
router.post('/batch', async (req, res) => {
    try {
        console.log('Batch adding interests:', req.body);
        const { user_id, interest_ids } = req.body;
        
        if (!user_id || !Array.isArray(interest_ids)) {
            return res.status(400).json({ 
                message: 'User ID and interest_ids array are required' 
            });
        }
        
        const results = [];
        
        for (const interest_id of interest_ids) {
            const result = await UserInterest.create(user_id, interest_id);
            results.push(result);
        }
        
        res.status(201).json({ success: true, results });
    } catch (error) {
        console.error('Error in batch add route:', error);
        res.status(500).json({ 
            message: 'Error adding batch user interests', 
            error: error.message 
        });
    }
});

// Replace all interests for a user (delete existing ones and add new ones)
router.put('/:userId', async (req, res) => {
    try {
        console.log('Replacing interests for user:', req.params.userId, 'with:', req.body);
        const userId = req.params.userId;
        const { interest_ids } = req.body;
        
        if (!Array.isArray(interest_ids)) {
            return res.status(400).json({ 
                message: 'interest_ids array is required' 
            });
        }
        
        // Get existing interests for comparison
        const existingResult = await UserInterest.read(userId);
        
        if (!existingResult.success) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const existingInterests = existingResult.interests;
        const existingInterestIds = existingInterests.map(interest => interest.interest_id);
        
        console.log('Existing interest IDs:', existingInterestIds);
        console.log('New interest IDs:', interest_ids);
        
        // Find interests to delete (existing but not in new list)
        for (const existingId of existingInterestIds) {
            if (!interest_ids.includes(existingId)) {
                console.log('Deleting interest:', existingId);
                await UserInterest.delete(userId, existingId);
            }
        }
        
        // Find interests to add (in new list but not existing)
        const results = [];
        for (const newId of interest_ids) {
            if (!existingInterestIds.includes(newId)) {
                console.log('Adding interest:', newId);
                const result = await UserInterest.create(userId, newId);
                results.push(result);
            }
        }
        
        // Get updated interests
        const updatedResult = await UserInterest.read(userId);
        res.status(200).json(updatedResult);
    } catch (error) {
        console.error('Error in PUT user interests route:', error);
        res.status(500).json({ 
            message: 'Error updating user interests', 
            error: error.message 
        });
    }
});

module.exports = router;