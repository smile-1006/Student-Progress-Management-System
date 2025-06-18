const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  contestId: {
    type: Number,
    required: true
  },
  contestName: {
    type: String,
    required: true
  },
  rank: {
    type: Number
  },
  oldRating: {
    type: Number
  },
  newRating: {
    type: Number
  },
  ratingChange: {
    type: Number
  },
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Compound index to ensure uniqueness of student-contestId pairs
contestSchema.index({ student: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model('Contest', contestSchema);