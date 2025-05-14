// server/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseByTitle } = require('../controllers/courseController');

router.get('/', getAllCourses);
router.get('/:title', getCourseByTitle);

module.exports = router;