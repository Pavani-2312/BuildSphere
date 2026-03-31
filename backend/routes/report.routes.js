const express = require('express');
const router = express.Router();
const { getReportData, exportPDF, exportDOCX } = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/:weekId', protect, getReportData);
router.get('/:weekId/pdf', protect, authorize('coordinator', 'admin'), exportPDF);
router.get('/:weekId/docx', protect, authorize('coordinator', 'admin'), exportDOCX);

module.exports = router;
