const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getCurrentUser,
  logout,
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authentication');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;