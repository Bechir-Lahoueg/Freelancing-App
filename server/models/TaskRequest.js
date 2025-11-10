import mongoose from 'mongoose';

const taskRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskType: {
    type: String,
    required: [true, 'Le type de tâche est requis'],
    enum: ['rédaction', 'codage', 'présentation', 'rapport', 'recherche', 'traduction', 'autre']
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
  options: {
    level: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé', 'expert'],
      default: 'intermédiaire'
    },
    deadline: {
      type: String,
      enum: ['24h', '48h', '1 semaine', '2 semaines', '1 mois'],
      default: '1 semaine'
    },
    complexity: {
      type: String,
      enum: ['simple', 'moyen', 'complexe', 'très complexe'],
      default: 'moyen'
    },
    pages: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
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
