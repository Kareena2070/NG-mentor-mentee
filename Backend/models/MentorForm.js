import mongoose from 'mongoose';

const mentorFormSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mentor ID is required']
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Mentee ID is required']
  },
  topicCovered: {
    type: String,
    required: [true, 'Topic/Activity covered is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  learningsFromMentee: {
    type: String,
    required: [true, 'What did you learn from the mentee is required'],
    trim: true,
    maxlength: [1000, 'Learning description cannot exceed 1000 characters']
  },
  menteeUnderstandingRating: {
    type: Number,
    required: [true, 'Understanding rating is required'],
    min: [1, 'Rating must be at least 1'], 
    max: [5, 'Rating must be at most 5']
  },
  progressComparison: {
    type: String,
    enum: ['Improved', 'Same', 'Needs Attention'],
    required: [true, 'Progress comparison is required']
  },
  challengesNoticed: {
    type: String,
    required: [true, 'Challenges noticed is required'],
    trim: true,
    maxlength: [1000, 'Challenges description cannot exceed 1000 characters']
  },
  feedbackForMentee: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    default: ''
  },
  starsRating: {
    type: Number,
    required: [true, 'Stars rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },
  sessionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance and to prevent duplicate entries for same mentor-mentee-date
mentorFormSchema.index({ mentor: 1, mentee: 1, sessionDate: 1 });
mentorFormSchema.index({ mentor: 1 });
mentorFormSchema.index({ mentee: 1 });
mentorFormSchema.index({ sessionDate: 1 });

// Virtual to get session date formatted
mentorFormSchema.virtual('formattedSessionDate').get(function() {
  return this.sessionDate.toISOString().split('T')[0];
});

// Static method to get progress data for a mentee
mentorFormSchema.statics.getMenteeProgressData = async function(menteeId) {
  return this.find({ mentee: menteeId })
    .populate('mentor', 'name')
    .sort({ sessionDate: 1 });
};

// Static method to get mentor's feedback history
mentorFormSchema.statics.getMentorFeedbackHistory = async function(mentorId) {
  return this.find({ mentor: mentorId })
    .populate('mentee', 'name')
    .sort({ sessionDate: -1 });
};

const MentorForm = mongoose.model('MentorForm', mentorFormSchema);

export default MentorForm;