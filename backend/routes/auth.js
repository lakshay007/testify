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
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default Free plan
    const user = new User({
      email,
      password: hashedPassword,
      plan: 'Free'  // Set default plan
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error signing up', error: error.message });
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
