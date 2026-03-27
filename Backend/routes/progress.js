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

// @route   GET /api/progress/consistency-streak/:userId
// @desc    Get consistency streak data (GitHub-like contribution calendar)
// @access  Private
router.get('/consistency-streak/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { months = 3 } = req.query;

    // Calculate date range (default: last 3 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    startDate.setDate(1); // Start from beginning of month

    let userForms = [];

    // Get forms based on user role
    const user = await User.findById(userId).select('role');
    
    if (user.role === 'mentor') {
      userForms = await MentorForm.find({
        mentor: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      }).select('sessionDate');
    } else if (user.role === 'mentee') {
      userForms = await MenteeForm.find({
        mentee: userId,
        sessionDate: { $gte: startDate, $lte: endDate }
      }).select('sessionDate');
    }

    // Group submissions by date
    const submissionsByDate = {};
    userForms.forEach(form => {
      const dateKey = form.sessionDate.toISOString().split('T')[0];
      submissionsByDate[dateKey] = (submissionsByDate[dateKey] || 0) + 1;
    });

    // Calculate streaks
    const sortedDates = Object.keys(submissionsByDate).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    sortedDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
      lastDate = currentDate;
    });

    res.json({
      success: true,
      data: {
        submissionsByDate,
        totalDaysWithSubmissions: sortedDates.length,
        currentStreak,
        longestStreak,
        timeRange: parseInt(months),
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Get consistency streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consistency streak data'
    });
  }
});

// @route   GET /api/progress/level/:userId
// @desc    Get user's level and progress in level system
// @access  Private
router.get('/level/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    let totalSubmissions = 0;

    // Get total submissions based on user role
    const user = await User.findById(userId).select('role name');
    
    if (user.role === 'mentor') {
      totalSubmissions = await MentorForm.countDocuments({ mentor: userId });
    } else if (user.role === 'mentee') {
      totalSubmissions = await MenteeForm.countDocuments({ mentee: userId });
    }

    // Determine level based on submission count
    let level = 1;
    let levelName = 'Beginner';
    let progressInLevel = 0;
    let requiredForNextLevel = 0;

    if (totalSubmissions >= 0 && totalSubmissions <= 5) {
      level = 1;
      levelName = 'Novice';
      progressInLevel = totalSubmissions;
      requiredForNextLevel = 6;
    } else if (totalSubmissions >= 6 && totalSubmissions <= 15) {
      level = 2;
      levelName = 'Intermediate';
      progressInLevel = totalSubmissions - 5;
      requiredForNextLevel = 10;
    } else if (totalSubmissions >= 16 && totalSubmissions <= 30) {
      level = 3;
      levelName = 'Advanced';
      progressInLevel = totalSubmissions - 15;
      requiredForNextLevel = 15;
    } else if (totalSubmissions > 30) {
      level = 4;
      levelName = 'Expert';
      progressInLevel = totalSubmissions - 30;
      requiredForNextLevel = null; // No limit for expert level
    }

    const progressPercentage = requiredForNextLevel 
      ? Math.round((progressInLevel / requiredForNextLevel) * 100)
      : 100;

    res.json({
      success: true,
      data: {
        user: { id: userId, name: user.name, role: user.role },
        level,
        levelName,
        totalSubmissions,
        progressInLevel,
        requiredForNextLevel,
        progressPercentage,
        levelRanges: {
          level1: { name: 'Novice', range: '0-5 logs' },
          level2: { name: 'Intermediate', range: '6-15 logs' },
          level3: { name: 'Advanced', range: '16-30 logs' },
          level4: { name: 'Expert', range: '30+ logs' }
        }
      }
    });

  } catch (error) {
    console.error('Get level data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch level data'
    });
  }
});

// @route   GET /api/progress/comparison/:menteeId
// @desc    Compare mentor's evaluation vs mentee's self-assessment
// @access  Private
router.get('/comparison/:menteeId', authenticate, async (req, res) => {
  try {
    const { menteeId } = req.params;
    const { timeRange = '30' } = req.query;

    // Check access permissions
    if (req.user.id !== menteeId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get mentee's confidence ratings
    const menteeConfidence = await MenteeForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('confidenceRating sessionDate mentor')
    .sort({ sessionDate: 1 })
    .populate('mentor', 'name');

    // Get mentor's understanding ratings for this mentee
    const mentorEvaluation = await MentorForm.find({
      mentee: menteeId,
      sessionDate: { $gte: startDate, $lte: endDate }
    })
    .select('menteeUnderstandingRating progressComparison sessionDate mentor')
    .sort({ sessionDate: 1 })
    .populate('mentor', 'name');

    // Calculate aggregated metrics
    const confidenceAvg = menteeConfidence.length > 0
      ? (menteeConfidence.reduce((sum, form) => sum + form.confidenceRating, 0) / menteeConfidence.length).toFixed(2)
      : 0;

    const understandingAvg = mentorEvaluation.length > 0
      ? (mentorEvaluation.reduce((sum, form) => sum + form.menteeUnderstandingRating, 0) / mentorEvaluation.length).toFixed(2)
      : 0;

    // Count progress statuses
    const progressCount = mentorEvaluation.reduce((acc, form) => {
      acc[form.progressComparison] = (acc[form.progressComparison] || 0) + 1;
      return acc;
    }, {});

    // Analyze alignment
    let alignment = 'neutral';
    const confidenceDiff = Math.abs(confidenceAvg - understandingAvg);
    
    if (confidenceAvg > understandingAvg + 0.5) {
      alignment = 'overconfident'; // Mentee confident but mentor sees room for improvement
    } else if (understandingAvg > confidenceAvg + 0.5) {
      alignment = 'underconfident'; // Mentor sees understanding but mentee lacks confidence
    } else if (confidenceDiff <= 0.5) {
      alignment = 'aligned'; // Good match between mentee confidence and mentor evaluation
    }

    // Determine learning gap
    let learningGapStatus = 'on_track';
    if (alignment === 'mismatched') {
      learningGapStatus = 'gap_identified';
    } else if (progressCount['Improved'] > progressCount['Needs Attention']) {
      learningGapStatus = 'progressing_well';
    }

    res.json({
      success: true,
      data: {
        mentee: menteeId,
        timeRange: parseInt(timeRange),
        menteeAssessment: {
          averageConfidence: parseFloat(confidenceAvg),
          totalSubmissions: menteeConfidence.length,
          data: menteeConfidence
        },
        mentorEvaluation: {
          averageUnderstanding: parseFloat(understandingAvg),
          totalEvaluations: mentorEvaluation.length,
          progressBreakdown: progressCount,
          data: mentorEvaluation
        },
        analysis: {
          alignment, // 'aligned', 'overconfident', 'underconfident', 'neutral'
          learningGapStatus, // 'on_track', 'gap_identified', 'progressing_well'
          confidenceDifference: parseFloat(confidenceDiff.toFixed(2)),
          insight: alignment === 'aligned' 
            ? 'Great alignment between mentee confidence and mentor evaluation!'
            : alignment === 'overconfident'
            ? 'Mentee may be overconfident. Focus on deeper understanding.'
            : alignment === 'underconfident'
            ? 'Mentee seems underconfident. Mentor sees more potential than mentee realizes.'
            : 'Alignment is neutral. Continue monitoring progress.'
        }
      }
    });

  } catch (error) {
    console.error('Get comparison data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comparison data'
    });
  }
});

export default router;