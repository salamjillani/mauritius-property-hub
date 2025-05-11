
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add review text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  reviewType: {
    type: String,
    enum: ['property', 'agent', 'agency'],
    required: [true, 'Please specify review type']
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property'
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  },
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per item
ReviewSchema.index(
  { 
    property: 1, 
    user: 1,
    reviewType: 1
  }, 
  { 
    unique: true,
    partialFilterExpression: { property: { $exists: true } }
  }
);

ReviewSchema.index(
  { 
    agent: 1, 
    user: 1,
    reviewType: 1
  }, 
  { 
    unique: true,
    partialFilterExpression: { agent: { $exists: true } }
  }
);

ReviewSchema.index(
  { 
    agency: 1, 
    user: 1,
    reviewType: 1
  }, 
  { 
    unique: true,
    partialFilterExpression: { agency: { $exists: true } }
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
