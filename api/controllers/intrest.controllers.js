const { pool } = require('../database'); 

// Controller to create a new interest
exports.createInterest = async (interestData) => {
    const { name, category } = interestData;

    try {
        const result = await pool.query(
            'INSERT INTO interests (name, category) VALUES ($1, $2) RETURNING *',
            [name, category]
        );
        return result.rows[0]; // Return the created interest
    } catch (error) {
        throw new Error('Failed to create interest: ' + error.message);
    }
};

// Controller to get an interest by ID
exports.getInterestById = async (interestId) => {
    try {
        const result = await pool.query('SELECT * FROM interests WHERE interest_id = $1', [interestId]);
        return result.rows[0]; // Return the interest or null if not found
    } catch (error) {
        throw new Error('Failed to retrieve interest: ' + error.message);
    }
};

// Controller to update an interest
exports.updateInterest = async (interestId, interestData) => {
    const { name, category } = interestData;

    try {
        const result = await pool.query(
            'UPDATE interests SET name = $1, category = $2 WHERE interest_id = $3 RETURNING *',
            [name, category, interestId]
        );
        return result.rows[0]; // Return the updated interest
    } catch (error) {
        throw new Error('Failed to update interest: ' + error.message);
    }
};

// Controller to delete an interest
exports.deleteInterest = async (interestId) => {
    try {
        const result = await pool.query(
            'DELETE FROM interests WHERE interest_id = $1 RETURNING *',
            [interestId]
        );
        return result.rowCount > 0; // Return true if a row was deleted
    } catch (error) {
        throw new Error('Failed to delete interest: ' + error.message);
    }
};
