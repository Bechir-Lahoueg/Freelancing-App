import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'comment_created', 
      'comment_deleted',
      'task_created',
      'task_updated',
      'task_completed',
      'message_received',
      'partner_request',
      'partner_approved',
      'partner_rejected',
      'invoice_created',
      'invoice_paid'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  relatedModel: {
    type: String,
    enum: ['Comment', 'TaskRequest', 'Conversation', 'PartnerRequest', 'Invoice'],
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-delete après 10 minutes (600 secondes)
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
