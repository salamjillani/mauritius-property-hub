const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PropertySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  address: {
    street: {
      type: String,
      required: false
    },
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
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  rentalPeriod: {
    type: String,
    enum: ['', 'day', 'month'],
    default: '',
    validate: {
      validator: function (v) {
        if (this.category === 'for-rent' || this.category === 'office-rent') {
          return v === 'day' || v === 'month';
        }
        return v === '';
      },
      message: 'Rental period must be "day" or "month" for rentals, empty for others'
    }
  },
  type: {
    type: String,
    required: [true, 'Please add a property type'],
    enum: [
      'Apartment',
      'House',
      'Villa',
      'Office',
      'Land',
      'Commercial',
      'Building',
      'Other'
    ]
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'for-sale',
      'for-rent',
      'offices',
      'office-rent',
      'land'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'rented'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number,
    required: [true, 'Please add property size in square meters'],
    min: [0, 'Size cannot be negative']
  },
  bedrooms: {
    type: Number,
    default: 0,
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    default: 0,
    min: [0, 'Bathrooms cannot be negative']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [
    {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String
      },
      caption: {
        type: String,
        default: ''
      },
      isMain: {
        type: Boolean,
        default: false
      }
    }
  ],
  virtualTourUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  floorPlanUrl: {
    type: String,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: false
  },
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: false
  },
  availableDates: [{
    from: Date,
    to: Date
  }],
  contactDetails: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    isRestricted: {
      type: Boolean,
      default: true // Contact details are hidden for non-logged-in users by default
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Text index for search functionality
PropertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text'
});

// Virtual for reviews
PropertySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'property',
  justOne: false
});

// Pre-save hook to ensure only one main image
PropertySchema.pre('save', function (next) {
  const mainImages = this.images.filter(img => img.isMain);
  if (mainImages.length > 1) {
    mainImages.slice(1).forEach(img => (img.isMain = false));
  }
  next();
});

// Pre-find hook to restrict contact details for non-authenticated users
PropertySchema.pre(['find', 'findOne'], function (next) {
  if (!this.options.isAuthenticated) {
    this.select('-contactDetails.phone -contactDetails.email');
  }
  next();
});

module.exports = mongoose.model('Property', PropertySchema);