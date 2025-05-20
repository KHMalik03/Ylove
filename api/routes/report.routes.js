const express = require('express');
const Report = require('../models/report');

const router = express.Router();

// Create a new report
router.post('/reports', async (req, res) => {
    try {
        const report = await Report.create(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create report' });
    }
});

// Get a report by ID
router.get('/reports/:id', async (req, res) => {
    try {
        const report = await Report.readById(req.params.id);
        if (report) {
            res.json(report);
        } else {
            res.status(404).json({ error: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve report' });
    }
});

// Get all reports by a reporter ID
router.get('/reports/reporter/:reporter_id', async (req, res) => {
    try {
        const reports = await Report.getReportsByReporterId(req.params.reporter_id);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
});

// Get all reports on a reported user (by reported ID)
router.get('/reports/reported/:reported_id', async (req, res) => {
    try {
        const reports = await Report.getReportsByReportedId(req.params.reported_id);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
});

// Update the status of a report (e.g., mark as resolved)
router.put('/reports/:id/status', async (req, res) => {
    try {
        const updatedReport = await Report.updateReportStatus(req.params.id, req.body.status);
        if (updatedReport) {
            res.json(updatedReport);
        } else {
            res.status(404).json({ error: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update report status' });
    }
});

// Delete a report
router.delete('/reports/:id', async (req, res) => {
    try {
        const deleted = await Report.delete(req.params.id);
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ error: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

module.exports = router;
