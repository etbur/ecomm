import mongoose from 'mongoose';

const dailyTaskSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means this is a parent session
  },
  sessionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'partial'],
    default: 'active'
  },
  tasksCompleted: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalTasks: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  rewardEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  rewardDistributed: {
    type: Number,
    default: 0,
    min: 0
  },
  childRewardSent: {
    type: Number,
    default: 0,
    min: 0
  },
  isFirstSession: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  luckyOrderTriggered: {
    type: Boolean,
    default: false
  },
  luckyOrderCommission: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
dailyTaskSessionSchema.index({ userId: 1, sessionDate: -1 });
dailyTaskSessionSchema.index({ parentUserId: 1, sessionDate: -1 });
dailyTaskSessionSchema.index({ status: 1, sessionDate: -1 });

export default mongoose.model('DailyTaskSession', dailyTaskSessionSchema);