const Week = require('../../database/models/Week');
const SectionStatus = require('../../database/models/SectionStatus');
const { SECTIONS, WEEK_STATUS } = require('../config/constants');

class WeekService {
  async createWeek(weekData, user) {
    const existingActive = await Week.findOne({
      department: user.department,
      status: WEEK_STATUS.ACTIVE
    });

    if (existingActive) {
      throw new Error('An active week already exists for this department');
    }

    const week = await Week.create({
      ...weekData,
      department: user.department,
      createdBy: user._id,
      createdByName: user.name
    });

    // Create section statuses for all sections
    const sectionStatuses = SECTIONS.map(section => ({
      weekId: week._id,
      department: user.department,
      section,
      status: 'pending',
      entryCount: 0
    }));

    await SectionStatus.insertMany(sectionStatuses);

    return week;
  }

  async getActiveWeek(department) {
    return await Week.findOne({
      department,
      status: WEEK_STATUS.ACTIVE
    });
  }

  async submitWeek(weekId, user) {
    const week = await Week.findById(weekId);

    if (!week) {
      throw new Error('Week not found');
    }

    if (week.status !== WEEK_STATUS.ACTIVE) {
      throw new Error('Week is not active');
    }

    week.status = WEEK_STATUS.SUBMITTED;
    week.submittedBy = user._id;
    week.submittedByName = user.name;
    week.submittedAt = new Date();

    await week.save();
    return week;
  }
}

module.exports = new WeekService();
