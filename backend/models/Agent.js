
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AgentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a professional title']
  },
  biography: String,
  specializations: [String],
  location: String,
  licenseNumber: String,
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  social: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  languages: [String],
  contactDetails: {
    email: String,
    phone: String,
    website: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with properties
AgentSchema.virtual('properties', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'agent',
  justOne: false
});

AgentSchema.virtual('listingsCount', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'agent',
  count: true
});

module.exports = mongoose.model('Agent', AgentSchema);
