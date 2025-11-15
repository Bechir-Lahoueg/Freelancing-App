import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  conversationCode: {
    type: String,
    unique: true,
    sparse: true, // Permet des valeurs null/undefined avec unique
    required: false // Rendre optionnel pour les anciennes conversations
  },
  assignedAgent: {
    name: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  taskRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskRequest',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      required: true
    }
  }],
  lastMessage: {
    content: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed', 'completed'],
    default: 'active'
  },
  closedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['admin_left', 'task_completed']
    },
    closedAt: Date
  },
  taskCompleted: {
    type: Boolean,
    default: false
  },
  completedAction: {
    type: String,
    enum: ['keep_open', 'close_conversation']
  }
}, {
  timestamps: true
});

// Index pour rechercher rapidement les conversations d'un utilisateur
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ taskRequestId: 1 });
// conversationCode index is already created by unique: true option

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
