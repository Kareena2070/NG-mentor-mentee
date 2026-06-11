import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['mentor', 'mentee', 'admin'],
    required: [true, 'Role is required'],
    default: 'mentee'
  },
  // Mentor-specific fields
  expertise: [{
    type: String,
    trim: true
  }],
  // Mentor's list of mentees (ObjectId refs)
  mentees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Mentee's linked mentor
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Profile information
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  // Status and verification
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Gamification
  logCount: {
    type: Number,
    default: 0
  },
  totalStarsReceived: {
    type: Number,
    default: 0
  },
  // Login tracking
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for level based on log count
userSchema.virtual('level').get(function () {
  if (this.logCount >= 31) return 4;
  if (this.logCount >= 16) return 3;
  if (this.logCount >= 6) return 2;
  return 1;
});

// Virtual for level label
userSchema.virtual('levelLabel').get(function () {
  const labels = { 1: 'Beginner', 2: 'Explorer', 3: 'Achiever', 4: 'Champion' };
  return labels[this.level] || 'Beginner';
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to update login info
userSchema.methods.updateLoginInfo = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

const User = mongoose.model('User', userSchema);

export default User;