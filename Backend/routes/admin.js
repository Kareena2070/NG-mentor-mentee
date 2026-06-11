import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Platform-wide statistics
// @access  Admin only
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalMentors, totalMentees, totalAdmins, totalTasks] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'mentor', isActive: true }),
      User.countDocuments({ role: 'mentee', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      Task.countDocuments()
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentUsers, recentTasks] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isActive: true }),
      Task.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Avg logs per user
    const avgLogs = totalUsers > 0 ? (totalTasks / totalUsers).toFixed(2) : 0;

    // Top active mentors (by log count)
    const topMentors = await User.find({ role: 'mentor', isActive: true })
      .sort({ logCount: -1 })
      .limit(5)
      .select('name email logCount totalStarsReceived');

    // Top active mentees
    const topMentees = await User.find({ role: 'mentee', isActive: true })
      .sort({ logCount: -1 })
      .limit(5)
      .select('name email logCount totalStarsReceived');

    // Daily task submissions for the last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentActivity = await Task.aggregate([
      { $match: { date: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalMentors, totalMentees, totalAdmins,
        totalTasks, recentUsers, recentTasks, avgLogs,
        topMentors, topMentees, recentActivity
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('mentees', 'name email')
      .populate('mentor', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: { current: page, pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get a single user's full profile
// @access  Admin only
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('mentees', 'name email logCount')
      .populate('mentor', 'name email');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const recentTasks = await Task.find({ submittedBy: user._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('relatedUser', 'name email');

    res.json({ success: true, user, recentTasks });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user's details (activate/deactivate, change role)
// @access  Admin only
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role, name, bio } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (role) update.role = role;
    if (name) update.name = name;
    if (bio !== undefined) update.bio = bio;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// @route   GET /api/admin/tasks
// @desc    Get all task logs with filters
// @access  Admin only
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, userId, startDate, endDate } = req.query;

    const query = {};
    if (role) query.submitterRole = role;
    if (userId) query.$or = [{ submittedBy: userId }, { relatedUser: userId }];

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const tasks = await Task.find(query)
      .populate('submittedBy', 'name email role')
      .populate('relatedUser', 'name email role')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      tasks,
      pagination: { current: page, pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('Admin get tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// @route   GET /api/admin/progress/:userId
// @desc    Get any user's progress (admin override)
// @access  Admin only
router.get('/progress/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const tasks = await Task.find({ submittedBy: user._id }).sort({ date: 1 });
    const calendar = {};
    tasks.forEach(t => {
      const d = t.date.toISOString().split('T')[0];
      calendar[d] = (calendar[d] || 0) + 1;
    });

    res.json({
      success: true,
      user,
      tasks,
      calendar,
      totalLogs: tasks.length
    });
  } catch (error) {
    console.error('Admin get progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user progress' });
  }
});

// @route   DELETE /api/admin/tasks/:id
// @desc    Delete a task log
// @access  Admin only
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Decrement log count
    await User.findByIdAndUpdate(task.submittedBy, { $inc: { logCount: -1 } });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Admin delete task error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

export default router;
