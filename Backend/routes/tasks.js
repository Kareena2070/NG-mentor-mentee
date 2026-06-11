import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/tasks
// @desc    Submit a daily task log (mentor or mentee)
// @access  Private (mentor + mentee)
router.post('/', authenticate, authorize('mentor', 'mentee'), async (req, res) => {
  try {
    const user = req.user;
    const role = user.role;

    let relatedUserId;

    if (role === 'mentor') {
      const { menteeId } = req.body;
      if (!menteeId) {
        return res.status(400).json({ success: false, message: 'menteeId is required for mentor submission' });
      }
      // Verify this mentee belongs to the mentor
      const mentor = await User.findById(user._id);
      if (!mentor.mentees.map(id => id.toString()).includes(menteeId)) {
        return res.status(403).json({ success: false, message: 'This mentee is not linked to you' });
      }
      relatedUserId = menteeId;
    } else {
      // Mentee — use their linked mentor
      const mentee = await User.findById(user._id);
      if (!mentee.mentor) {
        return res.status(400).json({ success: false, message: 'You are not linked to a mentor yet' });
      }
      relatedUserId = mentee.mentor;
    }

    const {
      topicCovered,
      // Mentor fields
      learnedFromMentee, menteeUnderstanding, menteeProgress,
      challengesNoticed, feedbackForMentee, starsForMentee,
      // Mentee fields
      learnedFromMentor, confidenceRating, appliedPracticed,
      practiceExample, whatWasDifficult, needsBetterExplanation, starsForMentor,
      date
    } = req.body;

    if (!topicCovered) {
      return res.status(400).json({ success: false, message: 'Topic covered is required' });
    }

    const taskData = {
      submittedBy: user._id,
      submitterRole: role,
      relatedUser: relatedUserId,
      topicCovered,
      date: date ? new Date(date) : new Date()
    };

    if (role === 'mentor') {
      if (!menteeUnderstanding || !starsForMentee) {
        return res.status(400).json({ success: false, message: 'menteeUnderstanding and starsForMentee are required for mentor form' });
      }
      Object.assign(taskData, {
        learnedFromMentee, menteeUnderstanding, menteeProgress,
        challengesNoticed, feedbackForMentee, starsForMentee
      });
    } else {
      if (!confidenceRating || starsForMentor === undefined) {
        return res.status(400).json({ success: false, message: 'confidenceRating and starsForMentor are required for mentee form' });
      }
      Object.assign(taskData, {
        learnedFromMentor, confidenceRating, appliedPracticed,
        practiceExample, whatWasDifficult, needsBetterExplanation, starsForMentor
      });
    }

    const task = new Task(taskData);
    await task.save();

    // Increment log count for gamification
    await User.findByIdAndUpdate(user._id, { $inc: { logCount: 1 } });

    // Track stars received on the related user
    const stars = role === 'mentor' ? starsForMentee : starsForMentor;
    if (stars) {
      await User.findByIdAndUpdate(relatedUserId, { $inc: { totalStarsReceived: stars } });
    }

    const populated = await task.populate([
      { path: 'submittedBy', select: 'name email role' },
      { path: 'relatedUser', select: 'name email role' }
    ]);

    res.status(201).json({ success: true, message: 'Task log submitted successfully', task: populated });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit task log' });
  }
});

// @route   GET /api/tasks/my
// @desc    Get current user's own task logs
// @access  Private
router.get('/my', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { submittedBy: req.user._id };
    if (Object.keys(dateFilter).length) query.date = dateFilter;

    const tasks = await Task.find(query)
      .populate('relatedUser', 'name email role')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({ success: true, tasks, pagination: { current: page, pages: Math.ceil(total / limit), total } });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// @route   GET /api/tasks/mentee/:menteeId
// @desc    Mentor views a specific mentee's logs (submitted by mentor about that mentee + mentee's own logs)
// @access  Private (Mentor only)
router.get('/mentee/:menteeId', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { menteeId } = req.params;

    // Verify ownership
    const mentor = await User.findById(req.user._id);
    if (!mentor.mentees.map(id => id.toString()).includes(menteeId)) {
      return res.status(403).json({ success: false, message: 'This mentee is not linked to you' });
    }

    const [mentorLogs, menteeLogs] = await Promise.all([
      Task.find({ submittedBy: req.user._id, relatedUser: menteeId }).sort({ date: -1 }),
      Task.find({ submittedBy: menteeId, relatedUser: req.user._id }).sort({ date: -1 })
    ]);

    res.json({ success: true, mentorLogs, menteeLogs });
  } catch (error) {
    console.error('Get mentee tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentee tasks' });
  }
});

// @route   GET /api/tasks/pair/:menteeId
// @desc    Get combined logs for a mentor-mentee pair (keyed by date)
// @access  Private (Mentor only)
router.get('/pair/:menteeId', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { menteeId } = req.params;

    const mentor = await User.findById(req.user._id);
    if (!mentor.mentees.map(id => id.toString()).includes(menteeId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [mentorLogs, menteeLogs] = await Promise.all([
      Task.find({ submittedBy: req.user._id, relatedUser: menteeId }).sort({ date: 1 }),
      Task.find({ submittedBy: menteeId, relatedUser: req.user._id }).sort({ date: 1 })
    ]);

    res.json({ success: true, mentorLogs, menteeLogs });
  } catch (error) {
    console.error('Get pair tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pair tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task log
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('submittedBy', 'name email role')
      .populate('relatedUser', 'name email role');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Only submitter, related user, or admin can view
    const isOwner = task.submittedBy._id.toString() === req.user._id.toString();
    const isRelated = task.relatedUser._id.toString() === req.user._id.toString();
    if (!isOwner && !isRelated && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
});

export default router;
