const express = require('express');
const router = express.Router();
const { getCourseDataForML } = require('../controllers/mlDataController');
const authMiddleware = require('../middlewares/authentication');

// Get course data for ML processing (protected route)
router.get('/course/:courseId', authMiddleware, getCourseDataForML);

module.exports = router;