const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  cfHandle: {
    type: String,
    trim: true
  },
  lastSyncTime: {
    type: Date
  },
  syncFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly'],
    default: 'daily'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  lastSubmissionDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);