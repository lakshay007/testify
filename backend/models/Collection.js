const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
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
    logo: String,
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
    testimonials:{
        type: Number,
        default: 0
    },
    customization: {
        cardBgColor: {
            type: String,
            default: "#ffffff"
        },
        cardBorderColor: {
            type: String,
            default: "#e5e7eb"
        },
        textColor: {
            type: String,
            default: "#374151"
        },
        fontSize: {
            type: String,
            default: "16"
        },
        borderRadius: {
            type: String,
            default: "8"
        },
        padding: {
            type: String,
            default: "24"
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
