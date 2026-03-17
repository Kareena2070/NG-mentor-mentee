import express from 'express';
import MentorForm from '../models/MentorForm.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware for mentor form
const mentorFormValidation = [
  body('menteeId')
    .notEmpty()
    .withMessage('Mentee selection is required')
    .isMongoId()
    .withMessage('Invalid mentee ID'),
  body('topicCovered')
    .trim()
    .notEmpty()
    .withMessage('Topic/Activity covered is required')
    .isLength({ max: 200 })
    .withMessage('Topic cannot exceed 200 characters'),
  body('learningsFromMentee')
    .trim() 
    .notEmpty()
    .withMessage('What you learned from mentee is required')
    .isLength({ max: 1000 })
    .withMessage('Learning description cannot exceed 1000 characters'),
  body('menteeUnderstandingRating')
    .toInt()
    .isInt({ min: 1, max: 5 })
    .withMessage('Understanding rating must be between 1 and 5'),
  body('progressComparison')
    .isIn(['Improved', 'Same', 'Needs Attention'])
    .withMessage('Progress comparison must be Improved, Same, or Needs Attention'),
  body('challengesNoticed')
    .trim()
    .notEmpty()
    .withMessage('Challenges noticed is required')
    .isLength({ max: 1000 })
    .withMessage('Challenges description cannot exceed 1000 characters'),
  body('feedbackForMentee')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
  body('starsRating')
    .toInt()
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars rating must be between 1 and 5')
];

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// @route   POST /api/mentor-forms
// @desc    Submit mentor form
// @access  Private (Mentor only)
router.post('/', authenticate, authorize('mentor'), mentorFormValidation, handleValidation, async (req, res) => {
  try {
    const { 
      menteeId, 
      topicCovered, 
      learningsFromMentee, 
      menteeUnderstandingRating,
      progressComparison,
      challengesNoticed,
      feedbackForMentee,
      starsRating
    } = req.body;

    // Verify mentee exists and is active
    const mentee = await User.findOne({ 
      _id: menteeId, 
      role: 'mentee', 
      isActive: true 
    });

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: 'Mentee not found or inactive'
      });
    }

    const mentorForm = new MentorForm({
      mentor: req.user.id,
      mentee: menteeId,
      topicCovered,
      learningsFromMentee,
      menteeUnderstandingRating,
      progressComparison,
      challengesNoticed,
      feedbackForMentee: feedbackForMentee || '',
      starsRating
    });

    await mentorForm.save();

    // Populate mentor and mentee info for response
    await mentorForm.populate('mentor', 'name email');
    await mentorForm.populate('mentee', 'name email');

    res.status(201).json({
      success: true,
      message: 'Mentor form submitted successfully',
      form: mentorForm
    });

  } catch (error) {
    console.error('Submit mentor form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit mentor form'
    });
  }
});

// @route   GET /api/mentor-forms
// @desc    Get mentor's submitted forms
// @access  Private (Mentor only)
router.get('/', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const { page = 1, limit = 10, menteeId, startDate, endDate } = req.query;
    
    let query = { mentor: req.user.id };
    
    // Filter by mentee if provided
    if (menteeId) {
      query.mentee = menteeId;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.sessionDate = {};
      if (startDate) {
        query.sessionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.sessionDate.$lte = new Date(endDate);
      }
    }

    const forms = await MentorForm.find(query)
      .populate('mentee', 'name email')
      .sort({ sessionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorForm.countDocuments(query);

    res.json({
      success: true,
      forms,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get mentor forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor forms'
    });
  }
});

// @route   GET /api/mentor-forms/mentees
// @desc    Get mentor's mentees for dropdown
// @access  Private (Mentor only)
router.get('/mentees', authenticate, authorize('mentor'), async (req, res) => {
  try {
    // Get all mentees that this mentor has worked with or can work with
    const mentees = await User.find({ 
      role: 'mentee', 
      isActive: true 
    }).select('name email');

    res.json({
      success: true,
      mentees
    });

  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentees'
    });
  }
});

// @route   GET /api/mentor-forms/:id
// @desc    Get specific mentor form
// @access  Private (Mentor only)
router.get('/:id', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const form = await MentorForm.findOne({
      _id: req.params.id,
      mentor: req.user.id
    }).populate('mentee', 'name email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      form
    });

  } catch (error) {
    console.error('Get mentor form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor form'
    });
  }
});

// @route   PUT /api/mentor-forms/:id
// @desc    Update mentor form
// @access  Private (Mentor only)
router.put('/:id', authenticate, authorize('mentor'), mentorFormValidation, handleValidation, async (req, res) => {
  try {
    const form = await MentorForm.findOneAndUpdate(
      { _id: req.params.id, mentor: req.user.id },
      { ...req.body, mentee: req.body.menteeId },
      { new: true, runValidators: true }
    ).populate('mentee', 'name email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form updated successfully',
      form
    });

  } catch (error) {
    console.error('Update mentor form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mentor form'
    });
  }
});

// @route   DELETE /api/mentor-forms/:id
// @desc    Delete mentor form
// @access  Private (Mentor only)
router.delete('/:id', authenticate, authorize('mentor'), async (req, res) => {
  try {
    const form = await MentorForm.findOneAndDelete({
      _id: req.params.id,
      mentor: req.user.id 
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });

  } catch (error) {
    console.error('Delete mentor form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mentor form'
    });
  }
});

export default router;