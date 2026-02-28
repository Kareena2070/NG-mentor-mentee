import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { updateProfileValidation, handleValidation } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('mentorshipPairs.user', 'name email role')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateProfileValidation, handleValidation, async (req, res) => {
  try {
    const { name, bio, expertise, profileImage } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    // Handle expertise for mentors
    if (expertise && req.user.role === 'mentor') {
      updateData.expertise = expertise.map(exp => exp.trim()).filter(exp => exp !== '');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @route   GET /api/users/mentors
// @desc    Get all mentors
// @access  Private
router.get('/mentors', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, expertise } = req.query;
    
    let query = { role: 'mentor', isActive: true };
    
    // Filter by expertise if provided
    if (expertise) {
      query.expertise = { $in: [new RegExp(expertise, 'i')] };
    }

    const mentors = await User.find(query)
      .select('name email expertise bio profileImage createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      mentors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors'
    });
  }
});

// @route   GET /api/users/mentees
// @desc    Get all mentees (mentor only)
// @access  Private (Mentor only)
router.get('/mentees', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const mentees = await User.find({ role: 'mentee', isActive: true })
      .select('name email bio profileImage createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'mentee', isActive: true });

    res.json({
      success: true,
      mentees,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentees'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isActive: true
    }).select('name email role expertise bio profileImage createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, role, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { expertise: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role expertise bio profileImage createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      isActive: false 
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (admin feature)
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalMentors = await User.countDocuments({ role: 'mentor', isActive: true });
    const totalMentees = await User.countDocuments({ role: 'mentee', isActive: true });
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMentors,
        totalMentees,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

export default router;