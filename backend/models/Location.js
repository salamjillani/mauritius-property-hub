const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  type: {
    type: String,
    enum: ['city', 'region'],
    required: [true, 'Please specify type'],
  },
  country: {
    type: String,
    required: [true, 'Please add a country'],
    default: 'Mauritius',
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Location', LocationSchema);