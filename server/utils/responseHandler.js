// Success response
const sendResponse = (res, statusCode, data) => {
    res.status(statusCode).json({
      success: true,
      ...data,
    });
  };
  
  // Error response
  const sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
      success: false,
      message,
    });
  };
  
  module.exports = {
    sendResponse,
    sendErrorResponse,
  };