const axios = require('axios');
const { STATUSCODE } = require('../constants');
const { createCustomError } = require('../utils/errorHandler');
const { sendResponse } = require('../utils/responseHandler');

// Get course recommendations for a user
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { recentCourseId } = req.query;
    
    // Call the ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    
    const response = await axios.post(`${mlServiceUrl}/recommend-courses`, {
      userId,
      recentCourseId
    });
    
    // Send the recommendations
    sendResponse(res, STATUSCODE.SUCCESS, {
      recommendations: response.data
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    next(createCustomError('Failed to get recommendations', STATUSCODE.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  getRecommendations
};