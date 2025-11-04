import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  type: {
    type: String,
    enum: ['task_activation', 'reward', 'bonus', 'referral'],
    default: 'task_activation'
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  generatedBy: {
    type: String,
    default: 'admin'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
voucherSchema.index({ userId: 1, status: 1 });
voucherSchema.index({ expiresAt: 1 });

export default mongoose.model('Voucher', voucherSchema);