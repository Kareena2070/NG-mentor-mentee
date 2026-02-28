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
    const { name, email, password, role, menteeEmail, expertise } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role
    };

    // Add mentor-specific fields if role is mentor
    if (role === 'mentor') {
      userData.menteeEmail = menteeEmail?.toLowerCase();
      userData.expertise = expertise.map(exp => exp.trim()).filter(exp => exp !== '');
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Update login info
    await user.updateLoginInfo();

    // Generate token and send response
    const tokenResponse = createTokenResponse(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...tokenResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login  
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update login info
    await user.updateLoginInfo();

    // Generate token and send response
    const tokenResponse = createTokenResponse(user);

    res.json({
      success: true,
      message: 'Login successful',
      ...tokenResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        expertise: user.expertise || [],
        menteeEmail: user.menteeEmail || null,
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, changePasswordValidation, handleValidation, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage. However, we can log the logout event.
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private  
router.get('/verify-token', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router;