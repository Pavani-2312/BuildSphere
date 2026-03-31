const ReportEntry = require('../../database/models/ReportEntry');
const Week = require('../../database/models/Week');
const SectionStatus = require('../../database/models/SectionStatus');
const { WEEK_STATUS } = require('../config/constants');

class EntryService {
  async createEntry(entryData, user, io) {
    const week = await Week.findById(entryData.weekId);

    if (!week || week.status !== WEEK_STATUS.ACTIVE) {
      throw new Error('Week is not active');
    }

    const entry = await ReportEntry.create({
      ...entryData,
      department: user.department,
      enteredBy: user._id,
      enteredByName: user.name,
      enteredByRole: user.role
    });

    // Update section status
    await SectionStatus.findOneAndUpdate(
      { weekId: entryData.weekId, section: entryData.section },
      { 
        $inc: { entryCount: 1 },
        status: 'in_progress'
      }
    );

    // Update week total entries
    week.totalEntries += 1;
    await week.save();

    // Emit socket event
    if (io) {
      io.to(user.department).emit('entry-created', { section: entryData.section, entry });
    }

    return entry;
  }

  async getEntries(weekId, section) {
    return await ReportEntry.find({
      weekId,
      section,
      isDeleted: false
    }).sort({ createdAt: -1 });
  }

  async deleteEntry(entryId, user, io) {
    const entry = await ReportEntry.findById(entryId);

    if (!entry) {
      throw new Error('Entry not found');
    }

    const week = await Week.findById(entry.weekId);
    if (week.status !== WEEK_STATUS.ACTIVE) {
      throw new Error('Cannot delete entry from submitted week');
    }

    entry.isDeleted = true;
    entry.deletedBy = user._id;
    entry.deletedAt = new Date();
    await entry.save();

    // Update section status
    await SectionStatus.findOneAndUpdate(
      { weekId: entry.weekId, section: entry.section },
      { $inc: { entryCount: -1 } }
    );

    // Emit socket event
    if (io) {
      io.to(user.department).emit('entry-deleted', { entryId: entry._id });
    }

    return entry;
  }
}

module.exports = new EntryService();
