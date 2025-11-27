import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0.00,
    min: 0
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Parent-Child System Fields
  userType: {
    type: String,
    enum: ['parent', 'child', 'regular'],
    default: 'regular'
  },
  parentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  childUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dailySessionActive: {
    type: Boolean,
    default: false
  },
  dailySessionsCompleted: {
    type: Number,
    default: 0
  },
  totalEarningsToday: {
    type: Number,
    default: 0
  },
  luckyOrderCount: {
    type: Number,
    default: 0
  },
  commissionEarned: {
    type: Number,
    default: 0
  },
  lastDailyReset: {
    type: String,
    default: null
  },
  // Withdrawal information
  withdrawalMethod: {
    type: String,
    enum: ['TRC20', 'ERC20', 'BEP20', 'Bank Transfer'],
    default: null
  },
  withdrawalAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = `REF${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for referral count
userSchema.virtual('referralCount').get(function() {
  return this.referrals ? this.referrals.length : 0;
});

// Virtual for child count
userSchema.virtual('childCount').get(function() {
  return this.childUsers ? this.childUsers.length : 0;
});

// Virtual for parent count
userSchema.virtual('hasParent').get(function() {
  return this.parentUser !== null;
});

// Method to check if user can start new daily session
userSchema.methods.canStartDailySession = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Reset daily counters if it's a new day
  if (this.lastDailyReset !== today.toDateString()) {
    this.totalEarningsToday = 0;
    this.dailySessionActive = false;
    this.lastDailyReset = today.toDateString();
    return true;
  }
  
  return !this.dailySessionActive;
};

// Method to activate daily session
userSchema.methods.activateDailySession = function() {
  this.dailySessionActive = true;
  return this.save();
};

// Method to complete daily session
userSchema.methods.completeDailySession = function() {
  this.dailySessionActive = false;
  this.dailySessionsCompleted += 1;
  return this.save();
};

// Method to add commission earnings
userSchema.methods.addCommission = function(amount) {
  this.commissionEarned += amount;
  this.totalEarningsToday += amount;
  return this.save();
};

// Method to add lucky order count
userSchema.methods.addLuckyOrder = function() {
  this.luckyOrderCount += 1;
  return this.save();
};

// Indexes for better query performance
userSchema.index({ parentUser: 1 });
userSchema.index({ childUsers: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ dailySessionActive: 1 });

export default mongoose.model('User', userSchema);