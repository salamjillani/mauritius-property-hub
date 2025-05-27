const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user can have only one active subscription
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true,
  },
  listingLimit: {
    type: Number,
    required: true,
    min: [0, 'Listing limit cannot be negative'],
  },
  listingsUsed: {
    type: Number,
    default: 0,
    min: [0, 'Listings used cannot be negative'],
  },
  featuredListings: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);