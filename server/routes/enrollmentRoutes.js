const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse,
  checkEnrollmentStatus
} = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/authentication');

// All enrollment routes require authentication
router.use(authMiddleware);

// Enroll in a course
router.post('/enroll', enrollInCourse);

// Get all enrolled courses
router.get('/my-courses', getEnrolledCourses);

// Unenroll from a course
router.delete('/unenroll/:courseId', unenrollFromCourse);

// Check enrollment status
router.get('/status/:courseId', checkEnrollmentStatus);

module.exports = router;