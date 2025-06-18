const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  contestId: {
    type: Number
  },
  name: {
    type: String
  },
  tags: [{
    type: String
  }],
  rating: {
    type: Number
  },
  status: {
    type: String,
    enum: ['AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'OTHER'],
    required: true
  },
  submissionId: {
    type: Number,
    required: true
  },
  submissionTime: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Compound index to ensure uniqueness of student-submissionId pairs
problemSchema.index({ student: 1, submissionId: 1 }, { unique: true });

module.exports = mongoose.model('Problem', problemSchema);