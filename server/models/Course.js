const mongoose = require('mongoose');

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
  topics: [TopicSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);