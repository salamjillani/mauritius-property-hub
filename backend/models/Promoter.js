const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromoterSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  logoUrl: {
    type: String,
    default: 'default-promoter-logo.png'
  },
  contactDetails: {
    email: String,
    phone: String,
    website: String
  },
  specialties: [String],
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

PromoterSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'promoter',
  justOne: false
});

PromoterSchema.virtual('projectsCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'promoter',
  count: true
});

module.exports = mongoose.model('Promoter', PromoterSchema);