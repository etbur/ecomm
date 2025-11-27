import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaName: {
    type: String,
    default: null
  },
  mediaSize: {
    type: Number,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ senderId: 1, createdAt: -1 });

// Virtual for conversation between user and admin
chatMessageSchema.virtual('conversation').get(function() {
  return this.conversationId;
});

// Method to mark message as read
chatMessageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

export default mongoose.model('ChatMessage', chatMessageSchema);