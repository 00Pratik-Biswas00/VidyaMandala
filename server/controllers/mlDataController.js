const Course = require('../models/Course');
const { STATUSCODE } = require('../constants');
const { createCustomError } = require('../utils/errorHandler');
const { sendResponse } = require('../utils/responseHandler');

// Get course data for ML processing
const getCourseDataForML = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Find course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return next(createCustomError(`No course found with id: ${courseId}`, STATUSCODE.NOT_FOUND));
    }

    // Format topics with required fields
    const formattedTopics = course.topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      baseHours: topic.baseHours || 1 // Default to 1 hour if not specified
    }));

    // Format MCQs with required fields
    const formattedMCQs = course.mcqs.map((mcq, index) => ({
      id: index + 1,
      question: mcq.question,
      options: mcq.options,
      answer: mcq.answer,
      difficulty: mcq.difficulty
    }));

    sendResponse(res, STATUSCODE.SUCCESS, {
      course: {
        id: course._id,
        title: course.title,
        category: course.category,
        language: course.language,
        topics: formattedTopics,
        mcqs: formattedMCQs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseDataForML
};