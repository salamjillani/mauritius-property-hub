const mongoose = require('mongoose');

const PromoterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a promoter name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Mauritius',
    },
  },
  contactDetails: {
    phone: String,
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    },
    website: String,
  },
  logo: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Promoter', PromoterSchema);