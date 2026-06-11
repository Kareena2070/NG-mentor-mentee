import express from 'express';
import User from '../models/User.js';
import { createTokenResponse } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  handleValidation,
  changePasswordValidation
} from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (mentor or mentee)
// @access  Public
router.post('/register', registerValidation, handleValidation, async (req, res) => {
  try {
    const { name, email, password, role, expertise } = req.body;

    // Prevent admin creation via this route
    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin registration requires a special endpoint' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role
    };

    if (role === 'mentor' && expertise && expertise.length > 0) {
      userData.expertise = expertise.map(exp => exp.trim()).filter(exp => exp !== '');
    }

    const user = new User(userData);
    await user.save();
    await user.updateLoginInfo();

    const tokenResponse = createTokenResponse(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...tokenResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// @route   POST /api/auth/register-admin
// @desc    Register a new admin (requires ADMIN_SECRET in header)
// @access  Semi-private (requires ADMIN_SECRET)
router.post('/register-admin', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid admin secret' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = new User({ name, email, password, role: 'admin', expertise: [] });
    await user.save();
    await user.updateLoginInfo();

    const tokenResponse = createTokenResponse(user);

    res.status(201).json({ success: true, message: 'Admin registration successful', ...tokenResponse });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Admin registration failed' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await user.updateLoginInfo();
    const tokenResponse = createTokenResponse(user);

    res.json({ success: true, message: 'Login successful', ...tokenResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('mentees', 'name email')
      .populate('mentor', 'name email');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        expertise: user.expertise || [],
        mentees: user.mentees || [],
        mentor: user.mentor || null,
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        logCount: user.logCount,
        level: user.level,
        levelLabel: user.levelLabel,
        totalStarsReceived: user.totalStarsReceived,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, changePasswordValidation, handleValidation, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: { id: req.user._id, email: req.user.email, role: req.user.role }
  });
});

export default router;