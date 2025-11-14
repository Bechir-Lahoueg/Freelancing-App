import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    avatar: String
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskRequest',
    default: null
  },
  text: {
    type: String,
    required: [true, 'Le commentaire est requis'],
    minlength: [10, 'Le commentaire doit contenir au moins 10 caractères'],
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'La note est requise']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

// Index pour les requêtes courantes
commentSchema.index({ status: 1, isPublished: 1 });
commentSchema.index({ taskId: 1 });
commentSchema.index({ 'user._id': 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
