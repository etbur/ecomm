import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyTaskSession',
    required: false
  },
  type: {
    type: String,
    enum: ['parent_child_reward', 'child_own_task', 'lucky_order_commission', 'deposit', 'withdrawal', 'parent_child_balance_transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  description: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  commissionRate: {
    type: Number,
    default: 0.0005, // 0.05%
    min: 0,
    max: 1
  },
  commissionAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ fromUserId: 1, createdAt: -1 });
transactionSchema.index({ toUserId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ sessionId: 1 });

export default mongoose.model('Transaction', transactionSchema);