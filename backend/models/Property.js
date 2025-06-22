const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PropertySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [5000, "Description cannot be more than 5000 characters"],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        default: "Mauritius",
        trim: true,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "MUR"],
      default: "MUR",
    },
    rentalPeriod: {
      type: String,
      enum: ["day", "month", ""],
      default: "",
      validate: {
        validator: function (v) {
          const isRental = ["for-rent", "office-rent"].includes(this.category);
          return isRental ? ["day", "month"].includes(v) : v === "";
        },
        message:
          'Rental period must be "day" or "month" for rentals, empty for others',
      },
    },
    type: {
      type: String,
      required: [true, "Please add a property type"],
      enum: [
        "Apartment",
        "House",
        "Villa",
        "Penthouse",
        "Duplex",
        "Land",
        "Office",
        "Commercial",
        "Other",
      ],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: ["for-sale", "for-rent", "offices", "office-rent", "land"],
    },
     isFeatured: {
    type: Boolean,
    default: false
  },
  isGoldCard: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "inactive",
        "expired",
      ],
      default: "approved",
    },
    area: {
      type: Number,
      required: [true, "Please add property area in square meters"],
      min: [0, "Area cannot be negative"],
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: [0, "Bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: [0, "Bathrooms cannot be negative"],
    },
    amenities: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Amenity name cannot be more than 50 characters"],
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
          match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please use a valid URL"],
        },
        publicId: {
          type: String,
        },
        caption: {
          type: String,
          trim: true,
          default: "",
          maxlength: [200, "Caption cannot be more than 200 characters"],
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    virtualTourUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please use a valid URL"],
    },
    videoUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please use a valid URL"],
    },
    floorPlanUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please use a valid URL"],
    },
    expiresAt: Date,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      index: true,
    },

    agency: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      index: true,
    },
    availableDates: [
      {
        startDate: {
          type: Date,
          required: [true, "Start date is required"],
        },
        endDate: {
          type: Date,
          required: [true, "End date is required"],
          validate: {
            validator: function (value) {
              return this.startDate < value;
            },
            message: "End date must be after start date",
          },
        },
        status: {
          type: String,
          enum: ["available", "booked", "unavailable"],
          default: "available",
        },
      },
    ],
    contactDetails: {
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-]{7,15}$/, "Please use a valid phone number"],
      },
      email: {
        type: String,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      },
      isRestricted: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Text index for search functionality
PropertySchema.index({
  title: "text",
  description: "text",
  "address.city": "text",
  "address.country": "text",
});

// Compound indexes for frequent queries
PropertySchema.index({ category: 1, status: 1 });
PropertySchema.index({ type: 1, price: 1 });
PropertySchema.index({ isFeatured: 1, status: 1 });
PropertySchema.index({ owner: 1, status: 1 });

// Virtual for reviews
PropertySchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "property",
  justOne: false,
});

// Pre-save hook to ensure only one main image
PropertySchema.pre("save", function (next) {
  if (this.images?.length > 0) {
    const mainImages = this.images.filter((img) => img.isMain);
    if (mainImages.length > 1) {
      mainImages.slice(1).forEach((img) => (img.isMain = false));
    }
    if (mainImages.length === 0) {
      this.images[0].isMain = true;
    }
  }
  next();
});

// Pre-save hook to validate coordinates
PropertySchema.pre("save", function (next) {
  if (this.location?.coordinates?.length === 2) {
    const [lng, lat] = this.location.coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return next(
        new Error(
          "Invalid coordinates: latitude must be -90 to 90, longitude -180 to 180"
        )
      );
    }
  } else if (
    this.isModified("location.coordinates") &&
    this.location.coordinates
  ) {
    return next(
      new Error(
        "Coordinates must contain exactly two numbers: [longitude, latitude]"
      )
    );
  }
  next();
});

// Pre-save hook to sync rentalPeriod with category
PropertySchema.pre("save", function (next) {
  const isRental = ["for-rent", "office-rent"].includes(this.category);
  if (!isRental && this.rentalPeriod !== "") {
    this.rentalPeriod = "";
  }
  if (!isRental && this.availableDates?.length > 0) {
    this.availableDates = [];
  }
  next();
});

PropertySchema.virtual("agentDetails", {
  ref: "Agent",
  localField: "agent",
  foreignField: "_id",
  justOne: true,
});

PropertySchema.virtual("agencyDetails", {
  ref: "Agency",
  localField: "agency",
  foreignField: "_id",
  justOne: true,
});

// Pre-save hook to validate images
PropertySchema.pre("save", function (next) {
  if (this.images?.length > 10) {
    return next(new Error("Cannot upload more than 10 images"));
  }
  next();
});

module.exports = mongoose.model("Property", PropertySchema);
