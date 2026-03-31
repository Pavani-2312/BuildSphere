const ReportEntry = require('../../database/models/ReportEntry');
const Week = require('../../database/models/Week');
const { SECTIONS } = require('../config/constants');

class ReportService {
  async assembleReportData(weekId) {
    const week = await Week.findById(weekId);
    if (!week) {
      throw new Error('Week not found');
    }

    const reportData = {
      week: {
        label: week.weekLabel,
        startDate: week.startDate,
        endDate: week.endDate,
        department: week.department,
        submittedBy: week.submittedByName,
        submittedAt: week.submittedAt
      },
      sections: {}
    };

    for (const section of SECTIONS) {
      const entries = await ReportEntry.find({
        weekId,
        section,
        isDeleted: false
      }).sort({ createdAt: 1 });

      reportData.sections[section] = entries.map(e => e.data);
    }

    return reportData;
  }
}

module.exports = new ReportService();
