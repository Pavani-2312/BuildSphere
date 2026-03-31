const reportService = require('../services/report.service');

exports.getReportData = async (req, res) => {
  try {
    const { weekId } = req.params;
    const reportData = await reportService.assembleReportData(weekId);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const { weekId } = req.params;
    // PDF generation will be implemented with Puppeteer
    res.status(501).json({ message: 'PDF export not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportDOCX = async (req, res) => {
  try {
    const { weekId } = req.params;
    // DOCX generation will be implemented
    res.status(501).json({ message: 'DOCX export not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
