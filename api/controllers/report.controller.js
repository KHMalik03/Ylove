const { pool } = require('../database');

// Controller to create a new report
exports.createReport = async (reportData) => {
    const { reporter_id, reported_id, reason, details } = reportData;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const status = false; // FALSE for pending

    try {
        // Vérifier si les utilisateurs existent
        const [usersExist] = await pool.query(
            'SELECT COUNT(*) as count FROM user WHERE user_id IN (?, ?)',
            [reporter_id, reported_id]
        );
        
        if (usersExist[0].count < 2) {
            throw new Error('One or both users do not exist');
        }
        
        const [result] = await pool.query(
            'INSERT INTO report (reporter_id, reported_id, reason, details, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)',
            [reporter_id, reported_id, reason, details, timestamp, status]
        );
        
        const [rows] = await pool.query('SELECT * FROM report WHERE report_id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        console.error('Error creating report:', error);
        throw new Error('Failed to create report: ' + error.message);
    }
};

// Controller to get a report by ID
exports.getReportById = async (reportId) => {
    try {
        console.log('Getting report with ID:', reportId);
        const [rows] = await pool.query('SELECT * FROM report WHERE report_id = ?', [reportId]);
        console.log('Query result:', rows);
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error retrieving report:', error);
        throw new Error('Failed to retrieve report: ' + error.message);
    }
};

// Controller to get all reports by a reporter_id
exports.getReportsByReporterId = async (reporterId) => {
    try {
        console.log('Getting reports for reporter ID:', reporterId);
        const [rows] = await pool.query('SELECT * FROM report WHERE reporter_id = ?', [reporterId]);
        console.log('Found', rows.length, 'reports');
        
        return rows;
    } catch (error) {
        console.error('Error retrieving reports by reporter:', error);
        throw new Error('Failed to retrieve reports: ' + error.message);
    }
};

// Controller to get all reports on a reported user (reported_id)
exports.getReportsByReportedId = async (reportedId) => {
    try {
        console.log('Getting reports for reported user ID:', reportedId);
        const [rows] = await pool.query('SELECT * FROM report WHERE reported_id = ?', [reportedId]);
        console.log('Found', rows.length, 'reports');
        
        return rows;
    } catch (error) {
        console.error('Error retrieving reports by reported user:', error);
        throw new Error('Failed to retrieve reports: ' + error.message);
    }
};

// Controller to update the status of a report (e.g., mark as resolved)
exports.updateReportStatus = async (reportId, status) => {
    try {
        const [result] = await pool.query(
            'UPDATE report SET status = ? WHERE report_id = ?',
            [status, reportId]
        );
        
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM report WHERE report_id = ?', [reportId]);
            return rows[0];
        }
        return null;
    } catch (error) {
        console.error('Error updating report status:', error);
        throw new Error('Failed to update report status: ' + error.message);
    }
};

// Controller to delete a report
exports.deleteReport = async (reportId) => {
    try {
        const [result] = await pool.query('DELETE FROM report WHERE report_id = ?', [reportId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting report:', error);
        throw new Error('Failed to delete report: ' + error.message);
    }
};