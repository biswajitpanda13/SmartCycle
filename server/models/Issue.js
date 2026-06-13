const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  bicycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bicycle',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueType: {
    type: String,
    enum: ['Flat Tire', 'Broken Chain', 'Brakes', 'Seat', 'Other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Issue', issueSchema);
