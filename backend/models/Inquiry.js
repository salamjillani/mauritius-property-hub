const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InquirySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: String,
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  },
  promoterId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model