const AuditLog = require('../../database/models/AuditLog');

class AuditLoggerService {
  async log({
    action,
    performedBy,
    performedByName,
    performedByRole,
    targetCollection,
    targetId = null,
    weekId = null,
    section = null,
    changeDescription,
    previousValue = null,
    newValue = null,
    ipAddress = null
  }) {
    try {
      await AuditLog.create({
        action,
        performedBy,
        performedByName,
        performedByRole,
        targetCollection,
        targetId,
        weekId,
        section,
        changeDescription,
        previousValue,
        newValue,
        ipAddress,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  async logEntry(action, entry, user, previousData = null) {
    await this.log({
      action,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      targetCollection: 'reportentries',
      targetId: entry._id,
      weekId: entry.weekId,
      section: entry.section,
      changeDescription: `${action} entry in ${entry.section}`,
      previousValue: previousData,
      newValue: entry.data,
      ipAddress: user.ipAddress
    });
  }

  async logWeek(action, week, user) {
    await this.log({
      action,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      targetCollection: 'weeks',
      targetId: week._id,
      weekId: week._id,
      changeDescription: `${action} week: ${week.weekLabel}`,
      newValue: { status: week.status },
      ipAddress: user.ipAddress
    });
  }

  async logUser(action, targetUser, performedBy) {
    await this.log({
      action,
      performedBy: performedBy._id,
      performedByName: performedBy.name,
      performedByRole: performedBy.role,
      targetCollection: 'users',
      targetId: targetUser._id,
      changeDescription: `${action} user: ${targetUser.email}`,
      newValue: { role: targetUser.role, isActive: targetUser.isActive },
      ipAddress: performedBy.ipAddress
    });
  }
}

module.exports = new AuditLoggerService();
