const Week = require('../../database/models/Week');
const ReportEntry = require('../../database/models/ReportEntry');
const SectionStatus = require('../../database/models/SectionStatus');

exports.getDashboardData = async (req, res) => {
  try {
    const department = req.user.department;
    
    const activeWeek = await Week.findOne({ department, status: 'active' });
    
    if (!activeWeek) {
      return res.json({ activeWeek: null, stats: null });
    }

    const totalEntries = await ReportEntry.countDocuments({
      weekId: activeWeek._id,
      isDeleted: false
    });

    const sectionStatuses = await SectionStatus.find({
      weekId: activeWeek._id,
      department
    });

    const completedSections = sectionStatuses.filter(s => s.status === 'completed').length;
    const inProgressSections = sectionStatuses.filter(s => s.status === 'in_progress').length;

    res.json({
      activeWeek,
      stats: {
        totalEntries,
        completedSections,
        inProgressSections,
        totalSections: sectionStatuses.length
      },
      sectionStatuses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
