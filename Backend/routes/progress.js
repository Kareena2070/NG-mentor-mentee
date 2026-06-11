import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper: build date-keyed series from tasks
function buildTimeSeries(tasks, field) {
  return tasks
    .filter(t => t[field] != null)
    .map(t => ({
      date: t.date.toISOString().split('T')[0],
      value: t[field]
    }));
}

// Helper: build contribution calendar (last 90 days)
function buildContributionCalendar(tasks) {
  const map = {};
  tasks.forEach(t => {
    const d = t.date.toISOString().split('T')[0];
    map[d] = (map[d] || 0) + 1;
  });
  return map;
}

// @route   GET /api/progress/me
// @desc    Get mentee's own self-reflection progress data
// @access  Private (mentee)
router.get('/me', authenticate, authorize('mentee'), async (req, res) => {
  try {
    const tasks = await Task.find({ submittedBy: req.user._id }).sort({ date: 1 });
    const mentorLogs = await Task.find({
      submittedBy: req.user.mentor,
      relatedUser: req.user._id
    }).sort({ date: 1 });

    const confidenceSeries = buildTimeSeries(tasks, 'confidenceRating');
    const calendar = buildContributionCalendar(tasks);

    const appliedCount = tasks.filter(t => t.appliedPracticed).length;
    const notAppliedCount = tasks.length - appliedCount;

    const avgStarsGiven = tasks.length
      ? (tasks.reduce((s, t) => s + (t.starsForMentor || 0), 0) / tasks.length).toFixed(2)
      : 0;

    const difficulties = tasks
      .map(t => t.whatWasDifficult)
      .filter(Boolean);

    const needsExplanation = tasks
      .map(t => t.needsBetterExplanation)
      .filter(Boolean);

    // Mentor's view of this mentee
    const understandingSeries = buildTimeSeries(mentorLogs, 'menteeUnderstanding');
    const avgStarsFromMentor = mentorLogs.length
      ? (mentorLogs.reduce((s, t) => s + (t.starsForMentee || 0), 0) / mentorLogs.length).toFixed(2)
      : 0;

    const progressStatus = mentorLogs.map(t => ({
      date: t.date.toISOString().split('T')[0],
      status: t.menteeProgress
    }));

    res.json({
      success: true,
      data: {
        totalLogs: tasks.length,
        confidenceSeries,
        appliedPracticed: { applied: appliedCount, notApplied: notAppliedCount },
        avgStarsGiven,
        difficulties,
        needsExplanation,
        calendar,
        // From mentor's logs about me
        understandingSeries,
        avgStarsFromMentor,
        progressStatus
      }
    });
  } catch (error) {
    console.error('Get progress/me error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
});

// @route   GET /api/progress/mentee/:menteeId
// @desc    Mentor views a specific mentee's progress analytics
// @access  Private (Mentor only)
router.get('/mentee/:menteeId', authenticate, authorize('mentor', 'admin'), async (req, res) => {
  try {
    const { menteeId } = req.params;

    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id);
      if (!mentor.mentees.map(id => id.toString()).includes(menteeId)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const mentee = await User.findById(menteeId).select('name email logCount totalStarsReceived');
    if (!mentee) return res.status(404).json({ success: false, message: 'Mentee not found' });

    const [mentorLogs, menteeLogs] = await Promise.all([
      Task.find({ submittedBy: req.user.role === 'admin' ? { $exists: true } : req.user._id, relatedUser: menteeId }).sort({ date: 1 }),
      Task.find({ submittedBy: menteeId }).sort({ date: 1 })
    ]);

    const understandingSeries = buildTimeSeries(mentorLogs, 'menteeUnderstanding');
    const confidenceSeries = buildTimeSeries(menteeLogs, 'confidenceRating');
    const starsFromMentor = buildTimeSeries(mentorLogs, 'starsForMentee');
    const calendar = buildContributionCalendar([...mentorLogs, ...menteeLogs]);

    const avgUnderstanding = understandingSeries.length
      ? (understandingSeries.reduce((s, d) => s + d.value, 0) / understandingSeries.length).toFixed(2)
      : 0;

    const avgConfidence = confidenceSeries.length
      ? (confidenceSeries.reduce((s, d) => s + d.value, 0) / confidenceSeries.length).toFixed(2)
      : 0;

    const progressHistory = mentorLogs.map(t => ({
      date: t.date.toISOString().split('T')[0],
      status: t.menteeProgress
    }));

    const challenges = mentorLogs.map(t => t.challengesNoticed).filter(Boolean);
    const difficulties = menteeLogs.map(t => t.whatWasDifficult).filter(Boolean);

    res.json({
      success: true,
      mentee,
      data: {
        understandingSeries,
        confidenceSeries,
        starsFromMentor,
        calendar,
        avgUnderstanding,
        avgConfidence,
        progressHistory,
        challenges,
        difficulties,
        totalMentorLogs: mentorLogs.length,
        totalMenteeLogs: menteeLogs.length
      }
    });
  } catch (error) {
    console.error('Get progress/mentee error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentee progress' });
  }
});

// @route   GET /api/progress/dashboard
// @desc    Dashboard data for current user (mentor or mentee)
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('mentees', 'name email logCount totalStarsReceived');

    if (req.user.role === 'mentor') {
      const myLogs = await Task.find({ submittedBy: req.user._id }).sort({ date: -1 }).limit(50);
      const calendar = buildContributionCalendar(myLogs);

      const menteesSummary = await Promise.all(
        (user.mentees || []).map(async (mentee) => {
          const [mLogs, eeLogs] = await Promise.all([
            Task.find({ submittedBy: req.user._id, relatedUser: mentee._id }).sort({ date: -1 }).limit(10),
            Task.find({ submittedBy: mentee._id, relatedUser: req.user._id }).sort({ date: -1 }).limit(10)
          ]);

          const avgUnderstanding = mLogs.length
            ? (mLogs.reduce((s, t) => s + (t.menteeUnderstanding || 0), 0) / mLogs.length).toFixed(2)
            : 0;
          const lastProgress = mLogs[0]?.menteeProgress || 'No data';

          return {
            mentee: { _id: mentee._id, name: mentee.name, email: mentee.email },
            avgUnderstanding,
            lastProgress,
            totalMentorLogs: mLogs.length,
            totalMenteeLogs: eeLogs.length
          };
        })
      );

      return res.json({
        success: true,
        role: 'mentor',
        user: { name: user.name, level: user.level, levelLabel: user.levelLabel, logCount: user.logCount },
        data: { calendar, menteesSummary, recentLogs: myLogs.slice(0, 5) }
      });
    }

    if (req.user.role === 'mentee') {
      const myLogs = await Task.find({ submittedBy: req.user._id }).sort({ date: -1 }).limit(50);
      const mentorLogs = await Task.find({
        relatedUser: req.user._id,
        submitterRole: 'mentor'
      }).sort({ date: -1 }).limit(50);

      const calendar = buildContributionCalendar([...myLogs, ...mentorLogs]);
      const confidenceSeries = buildTimeSeries([...myLogs].reverse(), 'confidenceRating').slice(-14);
      const understandingSeries = buildTimeSeries([...mentorLogs].reverse(), 'menteeUnderstanding').slice(-14);

      return res.json({
        success: true,
        role: 'mentee',
        user: { name: user.name, level: user.level, levelLabel: user.levelLabel, logCount: user.logCount },
        data: {
          calendar,
          confidenceSeries,
          understandingSeries,
          recentLogs: myLogs.slice(0, 5)
        }
      });
    }

    res.json({ success: true, role: req.user.role, message: 'Admin dashboard — use /api/admin/stats' });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
});

export default router;
