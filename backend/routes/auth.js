const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateLogin, handleValidationErrors, authenticateToken, isSignedIn } = require('../middleware/auth');
const crypto = require('crypto');
const sendEmail = require('../services/email');
const { forgotPasswordLimiter } = require('../middleware/rateLimiter');
require('dotenv').config();

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

// Forgot Password Route
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        // Save reset token and expiry to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log(process.env.FRONTEND_URL);

        // Prepare email content
        const emailOptions = {
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:
                  ${resetUrl}
                  This link will expire in 1 hour.
                  If you didn't request this, please ignore this email.`
        };

        // Send email using the new service
        await sendEmail(emailOptions);
        
        res.json({ message: 'Password reset link sent to email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

module.exports = router;
