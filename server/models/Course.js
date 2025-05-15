const mongoose = require('mongoose');

const MCQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length >= 2, 'At least 2 options are required']
  },
  answer: {
    type: String,
    required: true,
    validate: [
      function(val) {
        return this.options.includes(val);
      },
      'Answer must be one of the options'
    ]
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const TopicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  enrolled: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'English'
  },
  placeholderImage: {
    type: String,
    default: 'https://placehold.co/600x400'
  },
  topics: [TopicSchema],
  mcqs: [MCQSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);