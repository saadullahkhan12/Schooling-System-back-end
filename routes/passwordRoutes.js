// routes/passwordRoutes.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../config/email');

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Password reset email sent successfully',
      resetToken // Remove this in production - only for testing
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    console.log('🔄 Reset password endpoint hit');
    console.log('🔑 Token received:', req.params.token);
    
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log('📊 Database check - all users with tokens:');
    
    // DEBUG: Check all users with tokens
    const allUsers = await User.find({ resetPasswordToken: { $exists: true } });
    allUsers.forEach(user => {
      console.log('User:', user.username);
      console.log('DB Token:', user.resetPasswordToken);
      console.log('URL Token:', token);
      console.log('Exact Match?:', user.resetPasswordToken === token);
      console.log('---');
    });

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('👤 User found:', user ? user.username : 'None');
    
    if (!user) {
      console.log('❌ No user found with valid token');
      console.log('❌ Possible reasons:');
      console.log('   - Token mismatch');
      console.log('   - Token expired');
      console.log('   - User not found');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    console.log('✅ Token validated, updating password...');
    
    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    console.log('✅ Password updated successfully');

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('💥 Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;