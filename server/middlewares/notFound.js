const { STATUSCODE } = require('../constants');
const { sendErrorResponse } = require('../utils/responseHandler');

const notFoundMiddleware = (req, res) => {
  sendErrorResponse(
    res,
    STATUSCODE.NOT_FOUND,
    `Route not found: ${req.originalUrl}`
  );
};

module.exports = notFoundMiddleware;