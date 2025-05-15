const mongoose = require('mongoose');

const TopicProgressSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedAt: {
    type: Date
  }
});

const CourseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topics: [TopicProgressSchema],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure unique combination of userId and courseId
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);