const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  status: {
    type: String,
    enum: ['coming-soon', 'under-construction', 'delivered'],
    default: 'coming-soon'
  },
  promoter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Mauritius'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String },
      caption: { type: String, default: '' },
      isMain: { type: Boolean }
    }
  ],
  estimatedCompletion: Date,
  amenities: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Project', ProjectSchema);