const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateLogin, handleValidationErrors, authenticateToken, isSignedIn } = require('../middleware/auth');

const router = express.Router();

// Add health check route at the top
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        console.log('Received signup data:', req.body); // Add this for debugging

        const { firstName, lastName, email, password, phoneNumber } = req.body;

        // Validate all required fields are present
        if (!firstName || !lastName || !email || !password || !phoneNumber) {
            return res.status(400).json({ 
                message: 'All fields are required',
                receivedData: { firstName, lastName, email, phoneNumber } // Don't include password in logs
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phoneNumber
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ 
            message: 'Error in signup',
            error: error.message,
            details: error
        });
    }
});

// Login route
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token route
router.get('/verify', isSignedIn, (req, res) => {
  res.status(200).json({ message: 'Token is valid', userId: req.user.userId });
});

router.get('/user', isSignedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

module.exports = router;
