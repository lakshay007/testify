const express = require('express');
const Collection = require('../models/Collection');
const { isSignedIn } = require('../middleware/auth');

const router = express.Router();

// Create a new collection
router.post('/', isSignedIn, async (req, res) => {
  try {
    // Add validation for required fields
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    const {
      spaceName,
      headerTitle,
      customMessage,
      questions
    } = req.body;

    // Add validation for required fields
    if (!spaceName || !headerTitle || !customMessage || !questions?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if spaceName is already taken
    const existingCollection = await Collection.findOne({ spaceName });
    if (existingCollection) {
      return res.status(400).json({ message: 'Space name is already taken' });
    }

    // Sanitize and validate spaceName format
    const sanitizedSpaceName = spaceName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (sanitizedSpaceName !== spaceName) {
      return res.status(400).json({ message: 'Space name can only contain lowercase letters, numbers, and hyphens' });
    }

    const collection = new Collection({
      userId: req.user.userId,
      spaceName: sanitizedSpaceName,
      logo: req.body.logo,
      headerTitle,
      customMessage,
      questions,
      extraInfo: req.body.extraInfo || {},
      collectStarRatings: req.body.collectStarRatings || false,
      buttonColor: req.body.buttonColor || "#4F46E5",
      language: req.body.language || "English"
    });

    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ message: 'Error creating collection', error: error.message });
  }
});

// Get all collections for a user
router.get('/', isSignedIn, async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user.userId });
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Error fetching collections', error: error.message });
  }
});

// Get collection by spaceName (public route)
router.get('/:spaceName', async (req, res) => {
    try {
        const collection = await Collection.findOne(
            { spaceName: req.params.spaceName },
            { userId: 0, _id: 0 } // Exclude these fields
        );
        
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        res.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ 
            message: 'Error fetching collection', 
            error: error.message 
        });
    }
});

router.get('/private/:spaceName', isSignedIn, async (req, res) => {
  try {
      const collection = await Collection.findOne(
          { spaceName: req.params.spaceName, userId: req.user.userId }
      );
      
      if (!collection) {
          return res.status(404).json({ message: 'Collection not found' });
      }

      res.json(collection);
  } catch (error) {
      console.error('Error fetching collection:', error);
      res.status(500).json({ 
          message: 'Error fetching collection', 
          error: error.message 
      });
  }
});

// Update collection
router.put('/:spaceName', isSignedIn, async (req, res) => {
    try {
        const collection = await Collection.findOne({ 
            spaceName: req.params.spaceName,
            userId: req.user.userId 
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Update only allowed fields
        const updates = {
            logo: req.body.logo,
            headerTitle: req.body.headerTitle,
            customMessage: req.body.customMessage,
            questions: req.body.questions,
            extraInfo: req.body.extraInfo,
            collectStarRatings: req.body.collectStarRatings,
            buttonColor: req.body.buttonColor,
            language: req.body.language
        };

        const updatedCollection = await Collection.findOneAndUpdate(
            { spaceName: req.params.spaceName },
            updates,
            { new: true }
        );

        res.json(updatedCollection);
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ 
            message: 'Error updating collection', 
            error: error.message 
        });
    }
});

module.exports = router;
