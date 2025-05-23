const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  phone: {
    type: String,
    maxlength: [20, "Phone number cannot be longer than 20 characters"],
  },
  message: {
    type: String,
    required: [true, "Please add a message"],
    maxlength: [500, "Message cannot be more than 500 characters"],
  },
  property: {
    type: mongoose.Schema.ObjectId,
    ref: "Property",
    required: true,
  },
  agent: {
    type: mongoose.Schema.ObjectId,
    ref: "Agent",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Inquiry", InquirySchema);