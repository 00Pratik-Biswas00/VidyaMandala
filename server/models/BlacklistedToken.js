const mongoose = require('mongoose');

const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    expires: '7d', // Automatically remove entries after token would expire
    default: Date.now,
  },
});

module.exports = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);