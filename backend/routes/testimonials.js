const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const Collection = require('../models/Collection');
const { isSignedIn } = require('../middleware/auth');


router.post('/by-space/:spaceName', async (req, res) => {
    try {
        const collection = await Collection.findOne({ spaceName: req.params.spaceName });
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

       
        const testimonial = new Testimonial({
            collectionId: collection._id,
            userId: collection.userId,
            rating: req.body.rating,
            testimonialText: req.body.testimonialText,
            image: req.body.image,
            extraInfo: req.body.extraFields
        });

        await testimonial.save();

        // Increment the testimonials count in the collection
        await Collection.findByIdAndUpdate(
            collection._id,
            { $inc: { testimonials: 1 } },
            { new: true }
        );

        res.status(201).json(testimonial);
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ message: 'Error creating testimonial', error: error.message });
    }
});

// Get testimonials for a collection
router.get('/collection/:collectionId', isSignedIn, async (req, res) => {
    try {
        // First verify that the collection belongs to the user
        const collection = await Collection.findOne({
            _id: req.params.collectionId,
            userId: req.user.userId
        });

        if (!collection) {
            return res.status(403).json({ 
                message: 'Access denied: Collection not found or unauthorized' 
            });
        }

        // If authorized, fetch the testimonials
        const testimonials = await Testimonial.find({ 
            collectionId: req.params.collectionId 
        }).sort({ createdAt: -1 });

        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ 
            message: 'Error fetching testimonials', 
            error: error.message 
        });
    }
});

// Add this new route for public access to testimonials
router.get('/public/:spaceName', async (req, res) => {
    try {
        // Find the collection by spaceName
        const collection = await Collection.findOne({ spaceName: req.params.spaceName });
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Fetch testimonials for this collection
        const testimonials = await Testimonial.find({ 
            collectionId: collection._id 
        })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to recent testimonials

        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching public testimonials:', error);
        res.status(500).json({ 
            message: 'Error fetching testimonials', 
            error: error.message 
        });
    }
});

module.exports = router;
