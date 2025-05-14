const CourseProgress = require('../models/Progress');
const Course = require('../models/Course');
const { STATUSCODE } = require('../constants');
const { createCustomError } = require('../utils/errorHandler');
const { sendResponse } = require('../utils/responseHandler');
const User = require('../models/User');

// Create or update topic completion status
const updateTopicStatus = async (req, res, next) => {
  try {
    const { courseId, topicId, completed, grade: providedGrade } = req.body;
    const userId = req.user.userId;

    if (!courseId || !topicId) {
      return next(createCustomError('Course ID and Topic ID are required', STATUSCODE.BAD_REQUEST));
    }

    // Ensure the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(createCustomError('Course not found', STATUSCODE.NOT_FOUND));
    }

    // CHECK IF USER IS ENROLLED - Add this verification
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return next(createCustomError('You must be enrolled in this course to track progress', STATUSCODE.FORBIDDEN));
    }

    // Ensure the topic exists in the course
    const topicExists = course.topics.some(topic => topic.id === topicId);
    if (!topicExists) {
      return next(createCustomError('Topic not found in this course', STATUSCODE.NOT_FOUND));
    }

    // Generate a random grade between 70 and 100 if completed
    const grade = completed 
      ? (providedGrade !== null ? providedGrade : Math.floor(Math.random() * 31) + 70) 
      : 0;
    const completedAt = completed ? new Date() : null;

    // Find existing progress or create new
    let progress = await CourseProgress.findOne({ userId, courseId });
    
    if (!progress) {
      // Initialize progress with all topics from the course
      const initialTopics = course.topics.map(topic => ({
        topicId: topic.id,
        completed: topic.id === topicId ? completed : false,
        grade: topic.id === topicId ? grade : 0,
        completedAt: topic.id === topicId && completed ? completedAt : null
      }));

      progress = await CourseProgress.create({
        userId,
        courseId,
        topics: initialTopics
      });
    } else {
      // Update the specific topic
      const topicIndex = progress.topics.findIndex(t => t.topicId === topicId);
      
      if (topicIndex >= 0) {
        progress.topics[topicIndex].completed = completed;
        progress.topics[topicIndex].grade = grade;
        progress.topics[topicIndex].completedAt = completedAt;
      } else {
        progress.topics.push({
          topicId,
          completed,
          grade,
          completedAt
        });
      }

      // Update last updated timestamp
      progress.lastUpdated = Date.now();
      await progress.save();
    }

    // Calculate overall progress
    const totalTopics = course.topics.length;
    const completedTopics = progress.topics.filter(t => t.completed).length;
    progress.overallProgress = Math.round((completedTopics / totalTopics) * 100);
    await progress.save();

    sendResponse(res, STATUSCODE.SUCCESS, { 
      message: 'Topic status updated successfully',
      progress: {
        topic: {
          id: topicId,
          completed,
          grade
        },
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get course progress
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return next(createCustomError('You must be enrolled in this course to view progress', STATUSCODE.FORBIDDEN));
    }

    const progress = await CourseProgress.findOne({ userId, courseId });
    
    if (!progress) {
      // If no progress found, return empty progress
      const course = await Course.findById(courseId);
      if (!course) {
        return next(createCustomError('Course not found', STATUSCODE.NOT_FOUND));
      }
      
      const emptyProgress = {
        courseId,
        topics: course.topics.map(topic => ({
          topicId: topic.id,
          completed: false,
          grade: 0,
          completedAt: null
        })),
        overallProgress: 0
      };
      
      return sendResponse(res, STATUSCODE.SUCCESS, { progress: emptyProgress });
    }

    sendResponse(res, STATUSCODE.SUCCESS, { progress });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateTopicStatus,
  getCourseProgress
};