const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'create',
      'update',
      'delete',
      'submit_week',
      'login',
      'logout',
      'user_created',
      'role_changed',
      'status_changed'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByName: {
    type: String,
    required: true
  },
  performedByRole: {
    type: String,
    required: true
  },
  targetCollection: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  weekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week'
  },
  section: {
    type: String
  },
  changeDescription: {
    type: String,
    required: true
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: false
});

auditLogSchema.index({ weekId: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
