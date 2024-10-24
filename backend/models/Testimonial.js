const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false
    },
    testimonialText: {
        type: String,
        required: true
    },
    image: {
        type: String,  // Base64 encoded image
        required: false
    },
    extraInfo: {
        name: String,
        email: String,
        title: String,
        socialLink: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
