const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  totalBikes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Station', stationSchema);
