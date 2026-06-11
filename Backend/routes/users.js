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
      .populate('mentees', 'name email logCount totalStarsReceived')
      .populate('mentor', 'name email expertise')
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
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
    if (expertise && req.user.role === 'mentor') {
      updateData.expertise = expertise.map(exp => exp.trim()).filter(exp => exp !== '');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, updateData, { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// @route   POST /api/users/add-mentee
// @desc    Mentor links a mentee by email
// @access  Private (Mentor only)
router.post('/add-mentee', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { menteeEmail } = req.body;
    if (!menteeEmail) return res.status(400).json({ success: false, message: 'menteeEmail is required' });

    const mentee = await User.findOne({ email: menteeEmail.toLowerCase(), role: 'mentee', isActive: true });
    if (!mentee) return res.status(404).json({ success: false, message: 'Mentee not found with that email' });

    if (mentee.mentor && mentee.mentor.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'This mentee is already linked to you' });
    }

    if (mentee.mentor) {
      return res.status(400).json({ success: false, message: 'This mentee is already linked to another mentor' });
    }

    // Link mentor → mentee
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { mentees: mentee._id } });
    // Link mentee → mentor
    await User.findByIdAndUpdate(mentee._id, { mentor: req.user._id });

    res.json({ success: true, message: `${mentee.name} has been added as your mentee`, mentee: { _id: mentee._id, name: mentee.name, email: mentee.email } });
  } catch (error) {
    console.error('Add mentee error:', error);
    res.status(500).json({ success: false, message: 'Failed to add mentee' });
  }
});

// @route   DELETE /api/users/remove-mentee/:menteeId
// @desc    Mentor removes a mentee
// @access  Private (Mentor only)
router.delete('/remove-mentee/:menteeId', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { menteeId } = req.params;

    await User.findByIdAndUpdate(req.user._id, { $pull: { mentees: menteeId } });
    await User.findByIdAndUpdate(menteeId, { mentor: null });

    res.json({ success: true, message: 'Mentee removed successfully' });
  } catch (error) {
    console.error('Remove mentee error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove mentee' });
  }
});

// @route   GET /api/users/my-mentees
// @desc    Mentor gets their own mentee list
// @access  Private (Mentor only)
router.get('/my-mentees', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const mentor = await User.findById(req.user._id)
      .populate('mentees', 'name email bio profileImage logCount totalStarsReceived createdAt');

    res.json({ success: true, mentees: mentor.mentees || [] });
  } catch (error) {
    console.error('Get my mentees error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentees' });
  }
});

// @route   GET /api/users/my-mentor
// @desc    Mentee gets their linked mentor
// @access  Private (Mentee only)
router.get('/my-mentor', authenticate, authorize('mentee'), async (req, res) => {
  try {
    const mentee = await User.findById(req.user._id)
      .populate('mentor', 'name email bio expertise profileImage logCount createdAt');

    if (!mentee.mentor) {
      return res.json({ success: true, mentor: null, message: 'No mentor linked yet' });
    }

    res.json({ success: true, mentor: mentee.mentor });
  } catch (error) {
    console.error('Get my mentor error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentor' });
  }
});

// @route   GET /api/users/mentors
// @desc    Get all mentors (for mentees to browse)
// @access  Private
router.get('/mentors', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, expertise } = req.query;
    let query = { role: 'mentor', isActive: true };
    if (expertise) query.expertise = { $in: [new RegExp(expertise, 'i')] };

    const mentors = await User.find(query)
      .select('name email expertise bio profileImage logCount createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ logCount: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      mentors,
      pagination: { current: page, pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentors' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get top users by log count (leaderboard)
// @access  Private
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { role, limit = 10 } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;

    const users = await User.find(query)
      .select('name email role logCount totalStarsReceived')
      .sort({ logCount: -1, totalStarsReceived: -1 })
      .limit(limit * 1);

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// @route   GET /api/users/stats
// @desc    Get platform user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalMentors = await User.countDocuments({ role: 'mentor', isActive: true });
    const totalMentees = await User.countDocuments({ role: 'mentee', isActive: true });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isActive: true });

    res.json({ success: true, stats: { totalUsers, totalMentors, totalMentees, recentRegistrations } });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, role, page = 1, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });

    let query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { expertise: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    if (role) query.role = role;

    const users = await User.find(query)
      .select('name email role expertise bio profileImage createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    res.json({ success: true, users, pagination: { current: page, pages: Math.ceil(total / limit), total } });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isActive: true })
      .select('name email role expertise bio profileImage logCount createdAt');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate account' });
  }
});

export default router;