const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isSignedIn } = require('../middleware/auth');

const router = express.Router();

// Update profile (name and avatar)
router.put('/update', isSignedIn, async (req, res) => {
    try {
        const { firstName, lastName, avatarURL } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { firstName, lastName, avatarURL },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Update password
router.put('/password', isSignedIn, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get user with password
        const user = await User.findById(req.user.userId);
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect!' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

module.exports = router;