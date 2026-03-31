const SectionStatus = require('../../database/models/SectionStatus');

exports.getSectionStatuses = async (req, res) => {
  try {
    const { weekId } = req.query;
    
    const statuses = await SectionStatus.find({
      weekId,
      department: req.user.department
    });
    
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSectionStatus = async (req, res) => {
  try {
    const { weekId, section, status } = req.body;
    
    const sectionStatus = await SectionStatus.findOneAndUpdate(
      { weekId, section, department: req.user.department },
      { status, lastUpdatedBy: req.user._id, lastUpdatedByName: req.user.name },
      { new: true }
    );
    
    res.json(sectionStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
