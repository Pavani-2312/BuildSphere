const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  weekLabel: {
    type: String,
    required: [true, 'Week label is required'],
    minlength: [5, 'Week label must be at least 5 characters'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['active', 'submitted', 'archived'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedByName: {
    type: String
  },
  submittedAt: {
    type: Date
  },
  totalEntries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

weekSchema.index({ department: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'active' } 
});
weekSchema.index({ startDate: -1 });
weekSchema.index({ department: 1 });

module.exports = mongoose.model('Week', weekSchema);
