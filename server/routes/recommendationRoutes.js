const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const authMiddleware = require('../middlewares/authentication');

// All routes require authentication
router.use(authMiddleware);

// Get recommendations
router.get('/', getRecommendations);

module.exports = router;