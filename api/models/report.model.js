const ReportController = require('../controllers/report.controller.js');

class Report {
    report_id;
    reporter_id;
    reported_id;
    reason;
    details;
    timestamp;
    status;

    // Report class constructor
    constructor(report_id, reporter_id, reported_id, reason, details, timestamp, status) {
        this.report_id = report_id;
        this.reporter_id = reporter_id;
        this.reported_id = reported_id;
        this.reason = reason;
        this.details = details;
        this.timestamp = timestamp || new Date();
        this.status = status || false; // FALSE for pending, TRUE for resolved
    }

    // Create a new report
    static async create(reportData) {
        console.log('Model create called with:', reportData);
        return await ReportController.createReport(reportData);
    }

    // Read a report by ID
    static async readById(report_id) {
        console.log('Model readById called with:', report_id);
        return await ReportController.getReportById(report_id);
    }

    // Get all reports by reporter_id
    static async getReportsByReporterId(reporter_id) {
        console.log('Model getReportsByReporterId called with:', reporter_id);
        return await ReportController.getReportsByReporterId(reporter_id);
    }

    // Get all reports on a reported user (reported_id)
    static async getReportsByReportedId(reported_id) {
        console.log('Model getReportsByReportedId called with:', reported_id);
        return await ReportController.getReportsByReportedId(reported_id);
    }

    // Update the status of a report
    static async updateReportStatus(report_id, status) {
        console.log('Model updateReportStatus called with:', report_id, status);
        return await ReportController.updateReportStatus(report_id, status);
    }

    // Delete a report
    static async delete(report_id) {
        console.log('Model delete called with:', report_id);
        return await ReportController.deleteReport(report_id);
    }
}

module.exports = Report;