const Week = require('../../database/models/Week');

const validateWeek = async (req, res, next) => {
  try {
    const weekId = req.body.weekId || req.query.weekId;
    
    if (!weekId) {
      return res.status(400).json({ message: 'Week ID is required' });
    }

    const week = await Week.findById(weekId);
    
    if (!week) {
      return res.status(404).json({ message: 'Week not found' });
    }

    if (week.status !== 'active') {
      return res.status(400).json({ message: 'Week is not active' });
    }

    if (week.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied to this week' });
    }

    req.week = week;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = validateWeek;
