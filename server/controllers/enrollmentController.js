const User = require('../models/User');
const Course = require('../models/Course');
const { STATUSCODE } = require('../constants');
const { createCustomError } = require('../utils/errorHandler');
const { sendResponse } = require('../utils/responseHandler');

// Enroll a user in a course
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    if (!courseId) {
      return next(createCustomError('Course ID is required', STATUSCODE.BAD_REQUEST));
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(createCustomError('Course not found', STATUSCODE.NOT_FOUND));
    }

    // Check if user is already enrolled
    const user = await User.findById(userId);
    if (user.enrolledCourses.includes(courseId)) {
      return next(createCustomError('You are already enrolled in this course', STATUSCODE.BAD_REQUEST));
    }

    // Enroll user in course
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true, runValidators: true }
    );

    // Increment enrolled count in course
    await Course.findByIdAndUpdate(
      courseId,
      { $inc: { enrolled: 1 } },
      { new: true, runValidators: true }
    );

    sendResponse(res, STATUSCODE.SUCCESS, { 
      message: 'Successfully enrolled in course',
      courseId
    });
  } catch (error) {
    next(error);
  }
};

// Get all courses a user is enrolled in
const getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses',
        select: 'title category duration language placeholderImage enrolled topics'
      });

    if (!user) {
      return next(createCustomError('User not found', STATUSCODE.NOT_FOUND));
    }

    sendResponse(res, STATUSCODE.SUCCESS, { 
      count: user.enrolledCourses.length,
      courses: user.enrolledCourses 
    });
  } catch (error) {
    next(error);
  }
};

// Unenroll from a course
const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    if (!courseId) {
      return next(createCustomError('Course ID is required', STATUSCODE.BAD_REQUEST));
    }

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return next(createCustomError('You are not enrolled in this course', STATUSCODE.BAD_REQUEST));
    }

    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCourses: courseId } },
      { new: true, runValidators: true }
    );

    // Decrement enrolled count in course
    await Course.findByIdAndUpdate(
      courseId,
      { $inc: { enrolled: -1 } },
      { new: true, runValidators: true }
    );

    sendResponse(res, STATUSCODE.SUCCESS, { 
      message: 'Successfully unenrolled from course' 
    });
  } catch (error) {
    next(error);
  }
};

// Check if user is enrolled in a specific course
const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    if (!courseId) {
      return next(createCustomError('Course ID is required', STATUSCODE.BAD_REQUEST));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createCustomError('User not found', STATUSCODE.NOT_FOUND));
    }

    const isEnrolled = user.enrolledCourses.includes(courseId);

    sendResponse(res, STATUSCODE.SUCCESS, { 
      isEnrolled 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse,
  checkEnrollmentStatus
};