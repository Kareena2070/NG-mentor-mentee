import mongoose from 'mongoose';

const menteeFormSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: [true, 'Mentee ID is required']
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mentor ID is required']
  },
  topicCovered: {
    type: String,
    required: [true, 'Topic/Activity covered is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  learningsFromMentor: {
    type: String,
    required: [true, 'What did you learn from the mentor is required'],
    trim: true,
    maxlength: [1000, 'Learning description cannot exceed 1000 characters']
  },
  confidenceRating: {
    type: Number,
    required: [true, 'Confidence rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },
  appliedPracticed: {
    type: String,
    enum: ['Yes', 'No'],
    required: [true, 'Applied/practiced field is required']
  },
  practiceExample: {
    type: String,
    trim: true,
    maxlength: [500, 'Example cannot exceed 500 characters'],
    default: ''
  },
  difficultiesEncountered: {
    type: String, 
    required: [true, 'Difficulties encountered is required'],
    trim: true,
    maxlength: [1000, 'Difficulties description cannot exceed 1000 characters']
  },
  needsBetterExplanation: {
    type: String,
    required: [true, 'What needs better explanation is required'],
    trim: true,
    maxlength: [1000, 'Explanation request cannot exceed 1000 characters']
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

// Index for better performance and to prevent duplicate entries
menteeFormSchema.index({ mentee: 1, mentor: 1, sessionDate: 1 });
menteeFormSchema.index({ mentee: 1 });
menteeFormSchema.index({ mentor: 1 });
menteeFormSchema.index({ sessionDate: 1 });

// Virtual to get session date formatted
menteeFormSchema.virtual('formattedSessionDate').get(function() {
  return this.sessionDate.toISOString().split('T')[0];
});

// Static method to get self-reflection data for a mentee
menteeFormSchema.statics.getMenteeSelfReflectionData = async function(menteeId) {
  return this.find({ mentee: menteeId })
    .populate('mentor', 'name')
    .sort({ sessionDate: 1 });
};

// Static method to get mentor's ratings from mentees
menteeFormSchema.statics.getMentorRatings = async function(mentorId) {
  return this.find({ mentor: mentorId })
    .populate('mentee', 'name')
    .sort({ sessionDate: -1 });
};

// Static method to get practice statistics
menteeFormSchema.statics.getPracticeStats = async function(menteeId) {
  const stats = await this.aggregate([
    { $match: { mentee: new mongoose.Types.ObjectId(menteeId) } },
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
  
  return stats.length > 0 ? stats[0] : { totalSessions: 0, practicedSessions: 0 };
};

const MenteeForm = mongoose.model('MenteeForm', menteeFormSchema);

export default MenteeForm;