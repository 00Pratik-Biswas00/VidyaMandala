const User = require('../models/User');
const { STATUSCODE } = require('../constants');
const { createCustomError } = require('../utils/errorHandler');
const { sendResponse } = require('../utils/responseHandler');
const BlacklistedToken = require('../models/BlacklistedToken');

// Register a new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createCustomError('Email already in use', STATUSCODE.BAD_REQUEST));
    }

    // Create user
    const user = await User.create({ name, email, password });
    const token = user.createJWT();

    // Send response without exposing password
    sendResponse(res, STATUSCODE.CREATED, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createCustomError('Please provide email and password', STATUSCODE.BAD_REQUEST));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createCustomError('Invalid credentials', STATUSCODE.UNAUTHORIZED));
    }

    // Check if password matches
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return next(createCustomError('Invalid credentials', STATUSCODE.UNAUTHORIZED));
    }

    // Create token
    const token = user.createJWT();

    // Return user and token
    sendResponse(res, STATUSCODE.SUCCESS, { 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Get current user info
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('enrolledCourses', 'title category duration language placeholderImage');
    
    if (!user) {
      return next(createCustomError('User not found', STATUSCODE.NOT_FOUND));
    }

    sendResponse(res, STATUSCODE.SUCCESS, { user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      
      // Add the token to the blacklist
      await BlacklistedToken.create({ token });
      
      sendResponse(res, STATUSCODE.SUCCESS, { message: 'User logged out successfully!' });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};