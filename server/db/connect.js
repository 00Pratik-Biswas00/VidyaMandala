const mongoose = require('mongoose');

const connectDB = (url) => {
  // Remove deprecated options
  return mongoose.connect(url);
};

module.exports = connectDB;