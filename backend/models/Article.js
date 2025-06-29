const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  image: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add index for better performance
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ author: 1 });

module.exports = mongoose.model('Article', ArticleSchema);