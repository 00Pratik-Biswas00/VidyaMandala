// server/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseByTitle, getCourseById } = require('../controllers/courseController');

router.get('/', getAllCourses);
router.get('/:title', getCourseByTitle);
router.get('/id/:id', getCourseById);

module.exports = router;