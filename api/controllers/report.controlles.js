const { pool } = require('../database');

// Controller to create a new report
const createReport = async (reportData) => {
    const { reporter_id, reported_id, reason, details, timestamp, status } = reportData;

    try {
        const result = await pool.query(
            'INSERT INTO reports (reporter_id, reported_id, reason, details, timestamp, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [reporter_id, reported_id, reason, details, timestamp, status]
        );
        return result.rows[0]; // Return the created report record
    } catch (error) {
        throw new Error('Failed to create report: ' + error.message);
    }
};

// Controller to get a report by ID
const getReportById = async (reportId) => {
    try {
        const result = await pool.query('SELECT * FROM reports WHERE report_id = $1', [reportId]);
        return result.rows[0]; // Return the report or null if not found
    } catch (error) {
        throw new Error('Failed to retrieve report: ' + error.message);
    }
};

// Controller to get all reports by a reporter_id
const getReportsByReporterId = async (reporterId) => {
    try {
        const result = await pool.query('SELECT * FROM reports WHERE reporter_id = $1', [reporterId]);
        return result.rows; // Return all reports related to the reporter
    } catch (error) {
        throw new Error('Failed to retrieve reports: ' + error.message);
    }
};

// Controller to get all reports on a reported user (reported_id)
const getReportsByReportedId = async (reportedId) => {
    try {
        const result = await pool.query('SELECT * FROM reports WHERE reported_id = $1', [reportedId]);
        return result.rows; // Return all reports on the reported user
    } catch (error) {
        throw new Error('Failed to retrieve reports: ' + error.message);
    }
};

// Controller to update the status of a report (e.g., mark as resolved)
const updateReportStatus = async (reportId, status) => {
    try {
        const result = await pool.query(
            'UPDATE reports SET status = $1 WHERE report_id = $2 RETURNING *',
            [status, reportId]
        );
        return result.rows[0]; // Return the updated report
    } catch (error) {
        throw new Error('Failed to update report status: ' + error.message);
    }
};

// Controller to delete a report
const deleteReport = async (reportId) => {
    try {
        const result = await pool.query(
            'DELETE FROM reports WHERE report_id = $1 RETURNING *',
            [reportId]
        );
        return result.rowCount > 0; // Return true if a row was deleted
    } catch (error) {
        throw new Error('Failed to delete report: ' + error.message);
    }
};

module.exports = {
    createReport,
    getReportById,
    getReportsByReporterId,
    getReportsByReportedId,
    updateReportStatus,
    deleteReport
};
