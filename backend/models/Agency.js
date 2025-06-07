const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add an agency name'],
    trim: true,
  },
  logoUrl: {
    type: String,
    default: 'default-logo.jpg',
  },
  description: String,
  establishedYear: Number,
  website: String,
  facebook: String,
  twitter: String,
  linkedin: String,
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
  },
  agents: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Agent',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
  }, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


AgencySchema.virtual('listingsCount', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'agency',
  count: true
});

AgencySchema.virtual('properties', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'agency',
});

AgencySchema.pre('save', async function (next) {
  if (this.isModified('approvalStatus') && this.approvalStatus === 'approved') {
    await mongoose.model('User').findByIdAndUpdate(this.user, { 
      approvalStatus: 'approved',
      role: 'agency'
    });
  }
  next();
});

module.exports = mongoose.model('Agency', AgencySchema);