import mongoose from 'mongoose';

const taskRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  responses: [{
    questionId: String,
    questionLabel: String,
    answer: mongoose.Schema.Types.Mixed // String, Number, Array, etc.
  }],
  budget: {
    type: Number,
    min: 0
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  files: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mettre à jour la date de modification
taskRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TaskRequest = mongoose.model('TaskRequest', taskRequestSchema);

export default TaskRequest;
