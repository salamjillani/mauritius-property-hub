const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  photoUrl: {
    type: String,
    default: 'default-avatar.jpg',
  },
  professionalTitle: String,
  specialization: [String],
  biography: String,
  website: String,
  facebook: String,
  twitter: String,
  linkedin: String,
  isPremium: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
   agency: {
    type: mongoose.Schema.ObjectId,
    ref: 'Agency',
  },
  linkingRequests: [
    {
      agency: {
        type: mongoose.Schema.ObjectId,
        ref: 'Agency',
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AgentSchema.pre('save', async function (next) {
  if (this.isModified('approvalStatus') && this.approvalStatus === 'approved') {
    await mongoose.model('User').findByIdAndUpdate(this.user, { approvalStatus: 'approved' });
  }
  next();
});

module.exports = mongoose.model('Agent', AgentSchema);