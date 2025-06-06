const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "registration_approved",
      "registration_rejected",
      "agent_approved",
      "agent_rejected",
      "agency_approved",
      "agency_rejected",
      "promoter_approved",
      "promoter_rejected",
      "property_approved",
      "property_rejected",
      "property_pending",
      "new_property",
      "property_status_updated",
      "subscription_updated",
      "registration_request_submitted",
      "agency_link_request",
      "agency_link_request_received",
      "agency_link_approved",
      "agency_link_rejected",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
