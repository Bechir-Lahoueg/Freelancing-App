import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['comment_created', 'comment_deleted'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  comment: {
    _id: mongoose.Schema.Types.ObjectId,
    text: String,
    rating: Number,
    userEmail: String,
    userName: String
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete après 7 jours
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
