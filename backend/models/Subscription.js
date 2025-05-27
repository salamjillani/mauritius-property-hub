// models/Subscription.js
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['basic', 'elite', 'platinum'],
    required: true,
  },
  listingLimit: {
    type: Number,
    required: true,
  },
  listingsUsed: {
    type: Number,
    default: 0,
  },
  featuredListings: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'expired'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);