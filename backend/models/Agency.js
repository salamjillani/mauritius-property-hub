
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AgencySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add an agency name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  logoUrl: {
    type: String,
    default: 'default-agency-logo.png'
  },
  coverImageUrl: String,
  establishedYear: Number,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Mauritius'
    }
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  contactDetails: {
    email: String,
    phone: String,
    website: String
  },
  social: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with agents
AgencySchema.virtual('agents', {
  ref: 'Agent',
  localField: '_id',
  foreignField: 'agency',
  justOne: false
});

// Reverse populate with properties
AgencySchema.virtual('properties', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'agency',
  justOne: false
});

AgencySchema.virtual('listingsCount', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'agency',
  count: true
});

module.exports = mongoose.model('Agency', AgencySchema);
