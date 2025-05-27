const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['basic', 'elite', 'platinum'],
    default: 'basic'
  },
  listingLimit: {
    type: Number,
    required: true,
    min: 0
  },
  listingsUsed: {
    type: Number,
    default: 0
  },
  featuredListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'expired'],
    default: 'pending'
  },
  expirationDate: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt timestamp on save
SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);