const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Property = require("../models/Property");
const Agent = require("../models/Agent");
const Agency = require("../models/Agency");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { notifyNewProperty } = require("./admin");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getProperties = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  let query = Property.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort({
      isGoldCard: -1,
      isPremium: -1,
      isFeatured: -1,
      createdAt: -1,
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Property.countDocuments(JSON.parse(queryStr));

  query = query
    .skip(startIndex)
    .limit(limit)
    .populate("owner", "firstName lastName email")
    .populate({
      path: "agent",
      select: "user title isPremium",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .populate("agency", "name logoUrl");

  const properties = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    data: properties,
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse("Invalid property ID format", 400));
  }

  const property = await Property.findById(req.params.id)
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: "agent",
        select: "_id user title isPremium",
        populate: {
          path: "user",
          select: req.user
            ? "firstName lastName email contactDetails avatarUrl"
            : "firstName lastName",
        },
      },
      {
        path: "agency",
        select: "name logoUrl",
        populate: {
          path: "agents",
          select: "_id user title isPremium approvalStatus",
          populate: {
            path: "user",
            select: req.user
              ? "firstName lastName email contactDetails avatarUrl"
              : "firstName lastName",
          },
        },
      },
      { path: "owner", select: "firstName lastName email" },
    ]);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    ["pending", "rejected", "inactive"].includes(property.status) &&
    (!req.user ||
      (req.user.role !== "admin" && property.owner.toString() !== req.user.id))
  ) {
    return next(new ErrorResponse("Not authorized to view this property", 403));
  }

  res.status(200).json({ success: true, data: property });
});

exports.createProperty = asyncHandler(async (req, res, next) => {
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  // Early validation for required fields
  if (!req.body.title || !req.body.description || !req.body.price) {
    return next(new ErrorResponse("Missing required fields", 400));
  }

  // Authentication check
  if (!req.user || !req.user.id) {
    return next(new ErrorResponse("User not authenticated", 401));
  }

  // Find user
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Check approval status for certain roles
  if (
    ["agent", "agency", "promoter"].includes(user.role) &&
    user.approvalStatus !== "approved"
  ) {
    return next(
      new ErrorResponse(`Your ${user.role} profile is not approved`, 403)
    );
  }

  // Handle individual user restrictions
  if (user.role === "individual") {
    const activeListings = await Property.countDocuments({
      owner: user._id,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (activeListings > 0) {
      return next(
        new ErrorResponse(
          "Individuals can only have one active listing at a time",
          400
        )
      );
    }

    // Set expiration date for individual listings (60 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    req.body.expiresAt = expiresAt;
  }

  // Handle agency assignment
  if (user.role === "agency") {
    const agency = await Agency.findOne({ user: req.user.id });
    if (agency) {
      req.body.agency = agency._id;
    }
  } else if (user.role === "agent") {
    const agent = await Agent.findOne({ user: req.user.id }).populate("agency");
    if (agent && agent.agency) {
      req.body.agency = agent.agency._id;
    }
  }

  // Check listing limits
  if (user.listingLimit > 0) {
    const currentListings = await Property.countDocuments({ owner: user._id });
    if (currentListings >= user.listingLimit) {
      return next(new ErrorResponse("Listing limit reached", 403));
    }
  }

  // Set property data
  req.body.owner = req.user.id;
  req.body.status = user.role === "individual" ? "active" : "approved";

  try {
    // Create property with gold card logic
    const property = await Property.create({
      ...req.body,
      isGoldCard: req.body.isGoldCard && user.goldCards > 0
    });

    // Deduct gold card if used
    if (req.body.isGoldCard && user.goldCards > 0) {
      user.goldCards -= 1;
      await user.save();
    }
    
    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    return next(error);
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse("Invalid property ID format", 400));
  }

  let property = await Property.findById(req.params.id);
  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this property`,
        403
      )
    );
  }

  // SUBSCRIPTION RESTRICTIONS REMOVED FOR DEVELOPMENT
  // Allow all premium features without subscription validation

  // Handle status updates
  if (req.body.status) {
    if (req.user.role === "admin") {
      if (
        !["pending", "approved", "rejected", "active", "inactive"].includes(
          req.body.status
        )
      ) {
        return next(new ErrorResponse("Invalid status value", 400));
      }
    } else {
      if (!["active", "inactive"].includes(req.body.status)) {
        return next(new ErrorResponse("Invalid status for owner", 400));
      }
      if (req.body.status === "active") {
        req.body.status = "pending";
        try {
          await notifyNewProperty(property);
        } catch (notificationError) {
          console.log("Notification failed:", notificationError.message);
        }
      }
    }
  }

  // Update contact details for agents
  if (req.body.contactDetails && req.user.role === "agent") {
    req.body.contactDetails.isRestricted = true;
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: property });
});

// @desc    Search properties and count results
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = asyncHandler(async (req, res, next) => {
  const { category, q, type, maxPrice, minBeds, minBaths, minArea, amenities } =
    req.query;

  const filter = { status: "approved" };

  if (category) {
    filter.category = category;
  }

  if (type && type !== "all") {
    filter.type = type.charAt(0).toUpperCase() + type.slice(1);
  }

  if (maxPrice && !isNaN(maxPrice)) {
    filter.price = { $lte: parseFloat(maxPrice) };
  }

  if (minBeds && !isNaN(minBeds)) {
    filter.bedrooms = { $gte: parseInt(minBeds) };
  }

  if (minBaths && !isNaN(minBaths)) {
    filter.bathrooms = { $gte: parseFloat(minBaths) };
  }

  if (minArea && !isNaN(minArea)) {
    filter.area = { $gte: parseFloat(minArea) };
  }

  if (amenities) {
    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : amenities.split(",");
    filter.amenities = { $all: amenitiesArray };
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const count = await Property.countDocuments(filter);
  const properties = await Property.find(filter)
    .sort({
      isGoldCard: -1,
      isPremium: -1,
      isFeatured: -1,
      createdAt: -1,
    })
    .limit(20)
    .select(
      "title price currency category type address location bedrooms bathrooms area images isFeatured isPremium"
    )
    .populate([
      {
        path: "agent",
        select: "user title",
        populate: { path: "user", select: "firstName lastName" },
      },
      { path: "agency", select: "name logoUrl" },
    ]);

  res.status(200).json({
    success: true,
    count,
    data: properties,
    searchParams: {
      category,
      q,
      type,
      maxPrice,
      minBeds,
      minBaths,
      minArea,
      amenities,
    },
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse("Invalid property ID format", 400));
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this property`,
        403
      )
    );
  }

  // Delete associated images from Cloudinary
  if (property.images?.length > 0) {
    for (const image of property.images) {
      if (image.publicId) {
        await cloudinary.uploader
          .destroy(image.publicId)
          .catch((err) => console.error("Cloudinary delete error:", err));
      }
    }
  }

  await Property.deleteOne({ _id: req.params.id });

  // Optional: Update subscription usage if subscription exists
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (subscription) {
      subscription.listingsUsed = Math.max(
        0,
        (subscription.listingsUsed || 0) - 1
      );
      if (subscription.featuredListings) {
        subscription.featuredListings = subscription.featuredListings.filter(
          (id) => id.toString() !== req.params.id
        );
      }
      await subscription.save();
    }
  } catch (subscriptionError) {
    console.log("Subscription update failed:", subscriptionError.message);
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get property by category and ID
// @route   GET /api/properties/:category/:id
// @access  Public
exports.getPropertyByCategory = asyncHandler(async (req, res, next) => {
  const { category, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid property ID format", 400));
  }

  const validCategories = [
    "for-sale",
    "for-rent",
    "offices",
    "office-rent",
    "land",
  ];
  if (!validCategories.includes(category)) {
    return next(new ErrorResponse("Invalid property category", 400));
  }

  const property = await Property.findOne({ _id: id, category })
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      { path: "owner", select: "firstName lastName email" },
      {
        path: "agent",
        select: "user title isPremium",
        populate: {
          path: "user",
          select: "firstName lastName email contactDetails avatarUrl",
        },
      },
      { path: "agency", select: "name logoUrl" },
    ]);

  if (!property) {
    return next(
      new ErrorResponse(
        `Property not found with id of ${id} in category ${category}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: property });
});

exports.getFeaturedProperties = asyncHandler(async (req, res, next) => {
  const properties = await Property.find({
    $or: [{ isGoldCard: true }, { isPremium: true }, { isFeatured: true }],
  })
    .sort({
      isGoldCard: -1,
      isPremium: -1,
      isFeatured: -1,
      createdAt: -1,
    })

    .populate("owner", "firstName lastName email")
    .populate({
      path: "agent",
      select: "user title isPremium",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .populate("agency", "name logoUrl");

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// @desc    Get properties by category
// @route   GET /api/properties/category/:categorySlug
// @access  Public
exports.getPropertiesByCategory = asyncHandler(async (req, res, next) => {
  const { categorySlug } = req.params;
  const limit = parseInt(req.query.limit, 10) || 20;
  const page = parseInt(req.query.page, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const validCategories = [
    "for-sale",
    "for-rent",
    "offices",
    "office-rent",
    "land",
  ];
  if (!validCategories.includes(categorySlug)) {
    return next(new ErrorResponse("Invalid property category", 400));
  }

  const filter = { category: categorySlug, status: "approved" };
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort({ isFeatured: -1, isPremium: -1, createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: "agent",
        select: "user title isPremium",
        populate: {
          path: "user",
          select: req.user
            ? "firstName lastName email contactDetails avatarUrl"
            : "firstName lastName",
        },
      },
      { path: "agency", select: "name logoUrl" },
    ]);

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    total,
    data: properties,
  });
});

// @desc    Upload images for property
// @route   POST /api/properties/:id/images
// @access  Private
exports.uploadPropertyImages = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse("Invalid property ID format", 400));
  }

  const { cloudinaryUrls } = req.body;
  if (
    !cloudinaryUrls ||
    !Array.isArray(cloudinaryUrls) ||
    cloudinaryUrls.length === 0
  ) {
    return next(new ErrorResponse("Please provide valid image data", 400));
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this property`,
        403
      )
    );
  }

  const images = cloudinaryUrls.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    caption: img.caption || `Image ${property.images.length + index + 1}`,
    isMain: img.isMain || (property.images.length === 0 && index === 0),
  }));

  property.images = [...property.images, ...images];

  // Ensure only one main image
  const mainImages = property.images.filter((img) => img.isMain);
  if (mainImages.length > 1) {
    mainImages.slice(1).forEach((img) => (img.isMain = false));
  }
  if (mainImages.length === 0 && property.images.length > 0) {
    property.images[0].isMain = true;
  }

  await property.save();

  res.status(200).json({ success: true, data: property.images });
});

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
exports.deletePropertyImage = asyncHandler(async (req, res, next) => {
  const { id, imageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid property ID format", 400));
  }

  const property = await Property.findById(id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this property`,
        403
      )
    );
  }

  const imageIndex = property.images.findIndex(
    (img) => img._id.toString() === imageId
  );
  if (imageIndex === -1) {
    return next(
      new ErrorResponse(`Image not found with id of ${imageId}`, 404)
    );
  }

  const image = property.images[imageIndex];
  if (image.publicId) {
    await cloudinary.uploader
      .destroy(image.publicId)
      .catch((err) => console.error("Cloudinary delete error:", err));
  }

  property.images.splice(imageIndex, 1);
  if (image.isMain && property.images.length > 0) {
    property.images[0].isMain = true;
  }

  await property.save();

  res.status(200).json({ success: true, data: property.images });
});

// @desc    Get Cloudinary signature for direct uploads
// @route   GET /api/properties/cloudinary-signature
// @access  Private
// @desc    Get Cloudinary signature for direct uploads
// @route   GET /api/properties/cloudinary-signature
// @access  Private
exports.getCloudinarySignature = asyncHandler(async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `properties/${req.user.id}`;

  const params = {
    timestamp,
    folder,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "mauritius", // Default preset
  };

  // Only add upload_preset if it exists in environment
  if (process.env.CLOUDINARY_UPLOAD_PRESET) {
    params.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  }

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    success: true,
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      uploadPreset: params.upload_preset || null,
    },
  });
});
