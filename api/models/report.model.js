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
    static async create(reporter_id, reported_id, reason, details) {
        return await ReportController.createReport(reporter_id, reported_id, reason, details);
    }

    // Read a report by ID
    static async read(report_id) {
        return await ReportController.getReportById(report_id);
    }

    // Get all reports by reporter_id
    static async getAllByReporter(reporter_id) {
        return await ReportController.getReportsByReporterId(reporter_id);
    }

    // Get all reports on a reported user (reported_id)
    static async getAllByReported(reported_id) {
        return await ReportController.getReportsByReportedId(reported_id);
    }

    // Update the status of a report
    static async updateStatus(report_id, status) {
        return await ReportController.updateReportStatus(report_id, status);
    }

    // Delete a report
    static async delete(report_id) {
        return await ReportController.deleteReport(report_id);
    }
}

module.exports = Report;