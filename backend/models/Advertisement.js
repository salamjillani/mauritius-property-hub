const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  publicId: {
    type: String,
    required: [true, 'Please add a public ID'],
  },
  link: {
    type: String,
    required: [true, 'Please add a link'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema);