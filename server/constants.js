const constants = {
    // Server status codes
    STATUSCODE: {
      SUCCESS: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      INTERNAL_ERROR: 500,
    },
    // User roles
    USER_ROLES: {
      USER: 'USER',
      ADMIN: 'ADMIN',
    },
  };
  
  module.exports = constants;