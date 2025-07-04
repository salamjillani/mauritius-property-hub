const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  url: {
    type: String,
    required: [true, 'Please add a URL'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema);