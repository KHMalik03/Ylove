const { pool } = require('../database');

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

    // Add methods for CRUD operations here
}

module.exports = Report;