import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyTaskSession',
    default: null
  },
  taskType: {
    type: String,
    enum: ['rating', 'session_task'],
    default: 'rating'
  },
  reward: {
    type: Number,
    required: true,
    min: 0
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0
  },
  profit: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  isLuckyOrder: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: 'Product rating task completed'
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ sessionId: 1 });
taskSchema.index({ createdAt: -1 });

export default mongoose.model('Task', taskSchema);