const { STATUSCODE } = require('../constants');
const { sendErrorResponse } = require('../utils/responseHandler');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || STATUSCODE.INTERNAL_ERROR,
    message: err.message || 'Something went wrong, please try again',
  };

  // Handle mongoose errors
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = STATUSCODE.BAD_REQUEST;
  }

  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = STATUSCODE.BAD_REQUEST;
  }

  if (err.name === 'CastError') {
    customError.message = `No item found with id: ${err.value}`;
    customError.statusCode = STATUSCODE.NOT_FOUND;
  }

  sendErrorResponse(res, customError.statusCode, customError.message);
};

module.exports = errorHandlerMiddleware;