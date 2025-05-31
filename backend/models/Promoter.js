const mongoose = require('mongoose');

const PromoterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a promoter name'],
    trim: true,
  },
  logoUrl: {
    type: String,
    default: 'default-logo.jpg',
  },
  description: String,
  specialties: [String],
  establishedYear: Number,
  website: String,
  facebook: String,
  twitter: String,
  linkedin: String,
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PromoterSchema.pre('save', async function (next) {
  if (this.isModified('approvalStatus') && this.approvalStatus === 'approved') {
    await mongoose.model('User').findByIdAndUpdate(this.user, { approvalStatus: 'approved' });
  }
  next();
});

module.exports = mongoose.model('Promoter', PromoterSchema);