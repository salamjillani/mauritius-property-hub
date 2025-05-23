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
    required: [true, 'Please add a description']
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
    required: [true, 'Please add a price']
  },
  rentalPeriod: {
    type: String,
    enum: ['', 'day', 'month'],
    default: '',
    validate: {
      validator: function(v) {
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
  size: {
    type: Number,
    required: [true, 'Please add property size in square meters']
  },
  bedrooms: {
    type: Number,
    default: 0
  },
  bathrooms: {
    type: Number,
    default: 0
  },
  amenities: [String],
  images: [
    {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
      },
      caption: {
        type: String,
        default: ''
      },
      isMain: {
        type: Boolean,
      }
    }
  ],
  virtualTourUrl: String,
  videoUrl: String,
  floorPlanUrl: String,
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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PropertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text'
});

PropertySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'property',
  justOne: false
});

module.exports = mongoose.model('Property', PropertySchema);