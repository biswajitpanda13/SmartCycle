const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bicycle',
    required: true
  },
  destinationStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  duration: {
    type: Number // in minutes
  },
  coordinates: {
    type: [coordinateSchema],
    default: []
  },
  distanceKm: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ride', rideSchema);
