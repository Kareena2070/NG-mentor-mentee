import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submitterRole: {
    type: String,
    enum: ['mentor', 'mentee'],
    required: true
  },
  // The other party in the pair
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0)
  },

  // ─── Common Field ─────────────────────────────────────────────
  topicCovered: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },

  // ─── Mentor-Specific Fields ───────────────────────────────────
  learnedFromMentee: {
    type: String,
    trim: true,
    default: ''
  },
  menteeUnderstanding: {
    type: Number,
    min: 1,
    max: 5
  },
  menteeProgress: {
    type: String,
    enum: ['Improved', 'Same', 'Needs Attention', null],
    default: null
  },
  challengesNoticed: {
    type: String,
    trim: true,
    default: ''
  },
  feedbackForMentee: {
    type: String,
    trim: true,
    default: ''
  },
  starsForMentee: {
    type: Number,
    min: 1,
    max: 5
  },

  // ─── Mentee-Specific Fields ───────────────────────────────────
  learnedFromMentor: {
    type: String,
    trim: true,
    default: ''
  },
  confidenceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  appliedPracticed: {
    type: Boolean,
    default: false
  },
  practiceExample: {
    type: String,
    trim: true,
    default: ''
  },
  whatWasDifficult: {
    type: String,
    trim: true,
    default: ''
  },
  needsBetterExplanation: {
    type: String,
    trim: true,
    default: ''
  },
  starsForMentor: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ submittedBy: 1, date: -1 });
taskSchema.index({ relatedUser: 1, date: -1 });
taskSchema.index({ submitterRole: 1 });
taskSchema.index({ date: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
