const AuditLog = require('../../database/models/AuditLog');

class AuditLoggerService {
  async log(action, entityType, entityId, user, changes = {}) {
    try {
      await AuditLog.create({
        action,
        entityType,
        entityId,
        performedBy: user._id,
        performedByName: user.name,
        performedByRole: user.role,
        department: user.department,
        changes,
        ipAddress: user.ipAddress || 'unknown'
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }
}

module.exports = new AuditLoggerService();
