const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  privateKey: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  hasVoted: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
