const { pool } = require('../database'); 

// Controller to create a new interest
exports.createInterest = async (interestData) => {
    const { name, category } = interestData;

    try {
        const [result] = await pool.query(
            'INSERT INTO interest (name, category) VALUES (?, ?)',
            [name, category]
        );
        
        // Récupérer l'intérêt créé
        const [rows] = await pool.query('SELECT * FROM interest WHERE interest_id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating interest:', error);
        throw new Error('Failed to create interest: ' + error.message);
    }
};

// Controller to get an interest by ID
exports.getInterestById = async (interestId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM interest WHERE interest_id = ?', [interestId]);
        return rows[0];
    } catch (error) {
        console.error('Error retrieving interest:', error);
        throw new Error('Failed to retrieve interest: ' + error.message);
    }
};

// Controller to update an interest
exports.updateInterest = async (interestId, interestData) => {
    const { name, category } = interestData;

    try {
        const [result] = await pool.query(
            'UPDATE interest SET name = ?, category = ? WHERE interest_id = ?',
            [name, category, interestId]
        );
        
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM interest WHERE interest_id = ?', [interestId]);
            return rows[0];
        }
        return null;
    } catch (error) {
        console.error('Error updating interest:', error);
        throw new Error('Failed to update interest: ' + error.message);
    }
};

// Controller to delete an interest
exports.deleteInterest = async (interestId) => {
    try {
        const [result] = await pool.query('DELETE FROM interest WHERE interest_id = ?', [interestId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting interest:', error);
        throw new Error('Failed to delete interest: ' + error.message);
    }
};