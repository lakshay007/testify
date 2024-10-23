const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spaceName: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String
  },
  headerTitle: {
    type: String,
    required: true
  },
  customMessage: {
    type: String,
    required: true
  },
  questions: [{
    type: String,
    required: true
  }],
  extraInfo: {
    name: Boolean,
    email: Boolean,
    title: Boolean,
    socialLink: Boolean
  },
  collectStarRatings: {
    type: Boolean,
    default: false
  },
  buttonColor: {
    type: String,
    default: "#4F46E5"
  },
  language: {
    type: String,
    default: "English"
  },
  testimonials: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Collection', CollectionSchema);
