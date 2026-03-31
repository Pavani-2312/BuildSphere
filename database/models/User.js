const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['faculty', 'coordinator', 'admin'],
      message: '{VALUE} is not a valid role'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  employeeId: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastLogin: {
    type: Date
  },
  refreshTokenVersion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1, department: 1 });

module.exports = mongoose.model('User', userSchema);
