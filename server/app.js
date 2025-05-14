const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
// Import middleware
const errorHandlerMiddleware = require('./middlewares/errorHandler');
const notFoundMiddleware = require('./middlewares/notFound');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(
  {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollment', enrollmentRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;