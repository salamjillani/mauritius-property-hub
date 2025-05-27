// models/Availability.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available',
  },
});

module.exports = mongoose.model('Availability', AvailabilitySchema);