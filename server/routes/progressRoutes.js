const express = require('express');
const router = express.Router();
const {
  updateTopicStatus,
  getCourseProgress
} = require('../controllers/progressController');
const authMiddleware = require('../middlewares/authentication');

// All routes require authentication
router.use(authMiddleware);

// Update topic completion status
router.post('/update-topic', updateTopicStatus);

// Get course progress
router.get('/:courseId', getCourseProgress);

module.exports = router;