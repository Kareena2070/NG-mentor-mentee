import express from 'express';
import mongoose from 'mongoose';
import MentorForm from '../models/MentorForm.js';
import MenteeForm from '../models/MenteeForm.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/progress/mentee/:menteeId
// @desc    Get mentee progress data from mentor forms
// @access  Private
router.get('/mentee/:menteeId', authenticate, async (req, res) => {
  try {
    const { menteeId } = req.params;
    const { timeRange = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get mentee's understanding ratings over time (line chart data)
    const understandingData = await MentorForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('menteeUnderstandingRating sessionDate topicCovered')
    .sort({ sessionDate: 1 });

    // Get progress comparison data (heatmap data)
    const progressData = await MentorForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('progressComparison sessionDate');

    // Get average stars rating from mentor
    const starsData = await MentorForm.aggregate([
      {
        $match: {
          mentee: new mongoose.Types.ObjectId(menteeId),
          sessionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          averageStars: { $avg: '$starsRating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    // Get challenges word cloud data
    const challengesData = await MentorForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('challengesNoticed sessionDate')
    .sort({ sessionDate: -1 });

    // Get mentee info
    const mentee = await User.findById(menteeId).select('name email');

    res.json({
      success: true,
      data: {
        mentee,
        understandingRatings: understandingData,
        progressComparisons: progressData,
        averageStars: starsData.length > 0 ? starsData[0] : { averageStars: 0, totalRatings: 0 },
        challengesNoticed: challengesData,
        timeRange: parseInt(timeRange)
      }
    });

  } catch (error) {
    console.error('Get mentee progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentee progress data'
    });
  }
});

// @route   GET /api/progress/self-reflection/:menteeId
// @desc    Get mentee self-reflection data from mentee forms
// @access  Private
router.get('/self-reflection/:menteeId', authenticate, async (req, res) => {
  try {
    const { menteeId } = req.params;
    const { timeRange = '30' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get confidence ratings over time (line chart)
    const confidenceData = await MenteeForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('confidenceRating sessionDate topicCovered')
    .sort({ sessionDate: 1 });

    // Get practice statistics (pie chart)
    const practiceStats = await MenteeForm.aggregate([
      {
        $match: {
          mentee: new mongoose.Types.ObjectId(menteeId),
          sessionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$appliedPracticed',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get mentor ratings from this mentee (bar chart)
    const mentorRatings = await MenteeForm.aggregate([
      {
        $match: {
          mentee: new mongoose.Types.ObjectId(menteeId),
          sessionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$mentor',
          averageRating: { $avg: '$starsRating' },
          totalRatings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'mentorInfo'
        }
      },
      {
        $project: {
          averageRating: 1,
          totalRatings: 1,
          mentorName: { $arrayElemAt: ['$mentorInfo.name', 0] }
        }
      }
    ]);

    // Get difficulties and explanation requests
    const difficultiesData = await MenteeForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('difficultiesEncountered needsBetterExplanation sessionDate topicCovered')
    .sort({ sessionDate: -1 });

    res.json({
      success: true,
      data: {
        confidenceRatings: confidenceData,
        practiceStats,
        mentorRatings,
        difficulties: difficultiesData,
        timeRange: parseInt(timeRange)
      }
    });

  } catch (error) {
    console.error('Get self-reflection data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch self-reflection data'
    });
  }
});

// @route   GET /api/progress/mentor/:mentorId
// @desc    Get mentor's overall performance data
// @access  Private (Mentor only)
router.get('/mentor/:mentorId', authenticate, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { timeRange = '30' } = req.query;

    // Verify this is the mentor's own data or admin access
    if (req.user.id !== mentorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get ratings received from mentees
    const ratingsFromMentees = await MenteeForm.find({
      mentor: mentorId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .populate('mentee', 'name')
    .select('starsRating sessionDate mentee');

    // Get average understanding ratings given to mentees
    const understandingRatingsGiven = await MentorForm.find({
      mentor: mentorId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .populate('mentee', 'name')
    .select('menteeUnderstandingRating sessionDate mentee');

    // Get progress tracking summary
    const progressSummary = await MentorForm.aggregate([
      {
        $match: {
          mentor: new mongoose.Types.ObjectId(mentorId),
          sessionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$progressComparison',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get mentor info
    const mentor = await User.findById(mentorId).select('name email expertise');

    res.json({
      success: true,
      data: {
        mentor,
        ratingsFromMentees,
        understandingRatingsGiven,
        progressSummary,
        timeRange: parseInt(timeRange)
      }
    });

  } catch (error) {
    console.error('Get mentor performance data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor performance data'
    });
  }
});

// @route   GET /api/progress/dashboard
// @desc    Get dashboard data based on user role
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { timeRange = '30' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    let dashboardData = {};

    if (userRole === 'mentor') {
      // Mentor dashboard
      const totalMentees = await MentorForm.distinct('mentee', { mentor: userId });
      const totalSessions = await MentorForm.countDocuments({
        mentor: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      });

      const avgMenteeUnderstanding = await MentorForm.aggregate([
        {
          $match: {
            mentor: new mongoose.Types.ObjectId(userId),
            sessionDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avgUnderstanding: { $avg: '$menteeUnderstandingRating' }
          }
        }
      ]);

      const avgStarsFromMentees = await MenteeForm.aggregate([
        {
          $match: {
            mentor: new mongoose.Types.ObjectId(userId),
            sessionDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avgStars: { $avg: '$starsRating' }
          }
        }
      ]);

      dashboardData = {
        role: 'mentor',
        totalMentees: totalMentees.length,
        totalSessions,
        avgMenteeUnderstanding: avgMenteeUnderstanding.length > 0 ? avgMenteeUnderstanding[0].avgUnderstanding : 0,
        avgStarsFromMentees: avgStarsFromMentees.length > 0 ? avgStarsFromMentees[0].avgStars : 0
      };

    } else if (userRole === 'mentee') {
      // Mentee dashboard
      const totalMentors = await MenteeForm.distinct('mentor', { mentee: userId });
      const totalSessions = await MenteeForm.countDocuments({
        mentee: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      });

      const avgConfidence = await MenteeForm.aggregate([
        {
          $match: {
            mentee: new mongoose.Types.ObjectId(userId),
            sessionDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avgConfidence: { $avg: '$confidenceRating' }
          }
        }
      ]);

      const practiceRate = await MenteeForm.aggregate([
        {
          $match: {
            mentee: new mongoose.Types.ObjectId(userId),
            sessionDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            practicedSessions: {
              $sum: { $cond: [{ $eq: ['$appliedPracticed', 'Yes'] }, 1, 0] }
            }
          }
        }
      ]);

      dashboardData = {
        role: 'mentee',
        totalMentors: totalMentors.length,
        totalSessions,
        avgConfidence: avgConfidence.length > 0 ? avgConfidence[0].avgConfidence : 0,
        practiceRate: practiceRate.length > 0 ? 
          Math.round((practiceRate[0].practicedSessions / practiceRate[0].totalSessions) * 100) : 0
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// @route   GET /api/progress/analytics/:userId
// @desc    Get comprehensive analytics for a user
// @access  Private
router.get('/analytics/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30' } = req.query;

    // Check if user can access this data
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user info
    const user = await User.findById(userId).select('name email role');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    let analyticsData = {};

    if (user.role === 'mentor') {
      // Get mentor analytics
      const mentorForms = await MentorForm.find({
        mentor: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      }).populate('mentee', 'name');

      const menteeRatings = await MenteeForm.find({
        mentor: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      }).populate('mentee', 'name');

      analyticsData = {
        role: 'mentor',
        formsSubmitted: mentorForms,
        ratingsReceived: menteeRatings,
        totalMentees: [...new Set(mentorForms.map(f => f.mentee._id.toString()))]
      };

    } else if (user.role === 'mentee') {
      // Get mentee analytics  
      const menteeForms = await MenteeForm.find({
        mentee: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      }).populate('mentor', 'name');

      const mentorFeedback = await MentorForm.find({
        mentee: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      }).populate('mentor', 'name');

      analyticsData = {
        role: 'mentee',
        formsSubmitted: menteeForms,
        feedbackReceived: mentorFeedback,
        totalMentors: [...new Set(menteeForms.map(f => f.mentor._id.toString()))]
      };
    }

    res.json({
      success: true,
      data: {
        user,
        analytics: analyticsData,
        timeRange: parseInt(timeRange)
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

export default router;