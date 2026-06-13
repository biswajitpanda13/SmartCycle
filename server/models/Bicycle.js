const mongoose = require('mongoose');

const bicycleSchema = new mongoose.Schema({
  bikeId: {
    type: String,
    required: true,
    unique: true
  },
  bicycleName: {
    type: String,
    required: true
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'riding', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bicycle', bicycleSchema);
