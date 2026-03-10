import express from 'express';
import MenteeForm from '../models/MenteeForm.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware for mentee form
const menteeFormValidation = [
  body('mentorId')
    .notEmpty()
    .withMessage('Mentor ID is required')
    .isMongoId()
    .withMessage('Invalid mentor ID'),
  body('topicCovered')
    .trim()
    .notEmpty()
    .withMessage('Topic/Activity covered is required')
    .isLength({ max: 200 })
    .withMessage('Topic cannot exceed 200 characters'),
  body('learningsFromMentor')
    .trim()
    .notEmpty()
    .withMessage('What you learned from mentor is required')
    .isLength({ max: 1000 })
    .withMessage('Learning description cannot exceed 1000 characters'),
  body('confidenceRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Confidence rating must be between 1 and 5'),
  body('appliedPracticed')
    .isIn(['Yes', 'No'])
    .withMessage('Applied/Practiced must be Yes or No'),
  body('practiceExample')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Practice example cannot exceed 500 characters'),
  body('difficultiesEncountered')
    .trim()
    .notEmpty()
    .withMessage('Difficulties encountered is required')
    .isLength({ max: 1000 })
    .withMessage('Difficulties description cannot exceed 1000 characters'),
  body('needsBetterExplanation')
    .trim()
    .notEmpty()
    .withMessage('What needs better explanation is required')
    .isLength({ max: 1000 })
    .withMessage('Explanation request cannot exceed 1000 characters'),
  body('starsRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars rating must be between 1 and 5')
];

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/mentee-forms
// @desc    Submit mentee form
// @access  Private (Mentee only)
router.post('/', authenticate, authorize('mentee'), menteeFormValidation, handleValidation, async (req, res) => {
  try {
    const {
      mentorId,
      topicCovered,
      learningsFromMentor,
      confidenceRating,
      appliedPracticed,
      practiceExample,
      difficultiesEncountered,
      needsBetterExplanation,
      starsRating
    } = req.body;

    // Verify mentor exists and is active
    const mentor = await User.findOne({
      _id: mentorId,
      role: 'mentor',
      isActive: true
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found or inactive'
      });
    }

    const menteeForm = new MenteeForm({
      mentee: req.user.id,
      mentor: mentorId,
      topicCovered,
      learningsFromMentor,
      confidenceRating,
      appliedPracticed,
      practiceExample: practiceExample || '',
      difficultiesEncountered,
      needsBetterExplanation,
      starsRating
    });

    await menteeForm.save();

    // Populate mentor and mentee info for response
    await menteeForm.populate('mentor', 'name email');
    await menteeForm.populate('mentee', 'name email');

    res.status(201).json({
      success: true,
      message: 'Mentee form submitted successfully',
      form: menteeForm
    });

  } catch (error) {
    console.error('Submit mentee form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit mentee form'
    });
  }
});

// @route   GET /api/mentee-forms
// @desc    Get mentee's submitted forms
// @access  Private (Mentee only)
router.get('/', authenticate, authorize('mentee'), async (req, res) => {
  try {
    const { page = 1, limit = 10, mentorId, startDate, endDate } = req.query;
    
    let query = { mentee: req.user.id };
    
    // Filter by mentor if provided
    if (mentorId) {
      query.mentor = mentorId;
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

    const forms = await MenteeForm.find(query)
      .populate('mentor', 'name email')
      .sort({ sessionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MenteeForm.countDocuments(query);

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
    console.error('Get mentee forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentee forms'
    });
  }
});

// @route   GET /api/mentee-forms/mentors
// @desc    Get available mentors for dropdown
// @access  Private (Mentee only)
router.get('/mentors', authenticate, authorize('mentee'), async (req, res) => {
  try {
    // Get all active mentors
    const mentors = await User.find({ 
      role: 'mentor', 
      isActive: true 
    }).select('name email expertise');

    res.json({
      success: true,
      mentors
    });

  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors'
    });
  }
});

// @route   GET /api/mentee-forms/:id
// @desc    Get specific mentee form
// @access  Private (Mentee only)
router.get('/:id', authenticate, authorize('mentee'), async (req, res) => {
  try {
    const form = await MenteeForm.findOne({
      _id: req.params.id,
      mentee: req.user.id
    }).populate('mentor', 'name email');

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
    console.error('Get mentee form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentee form'
    });
  }
});

// @route   PUT /api/mentee-forms/:id
// @desc    Update mentee form
// @access  Private (Mentee only)
router.put('/:id', authenticate, authorize('mentee'), menteeFormValidation, handleValidation, async (req, res) => {
  try {
    const form = await MenteeForm.findOneAndUpdate(
      { _id: req.params.id, mentee: req.user.id },
      { ...req.body, mentor: req.body.mentorId },
      { new: true, runValidators: true }
    ).populate('mentor', 'name email');

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
    console.error('Update mentee form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mentee form'
    });
  }
});

// @route   DELETE /api/mentee-forms/:id
// @desc    Delete mentee form
// @access  Private (Mentee only)
router.delete('/:id', authenticate, authorize('mentee'), async (req, res) => {
  try {
    const form = await MenteeForm.findOneAndDelete({
      _id: req.params.id,
      mentee: req.user.id
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
    console.error('Delete mentee form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mentee form'
    });
  }
});

export default router;