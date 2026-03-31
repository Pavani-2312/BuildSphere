const reportService = require('../services/report.service');
const pdfExporter = require('../services/pdfExporter.service');
const docxExporter = require('../services/docxExporter.service');

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
    const reportData = await reportService.assembleReportData(weekId);
    const pdf = await pdfExporter.generatePDF(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportData.week.label}.pdf`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportDOCX = async (req, res) => {
  try {
    const { weekId } = req.params;
    const reportData = await reportService.assembleReportData(weekId);
    const docx = await docxExporter.generateDOCX(reportData);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportData.week.label}.docx`);
    res.send(docx);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
