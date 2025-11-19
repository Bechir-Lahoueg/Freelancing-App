import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  icon: {
    type: String,
    default: '📋'
  },
  image: {
    type: String
  },
  questions: [{
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'date', 'email', 'tel'],
      default: 'text'
    },
    options: [String], // Pour select, radio, checkbox
    placeholder: String,
    required: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    // ✨ NOUVEAU : Sous-champs personnalisés
    fields: [{
      id: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'textarea', 'number', 'date', 'email', 'tel'],
        default: 'text'
      },
      placeholder: String,
      required: {
        type: Boolean,
        default: false
      }
    }]
  }],
  basePrice: {
    type: Number,
    required: [true, 'Le prix de base est requis'],
    default: 0
  },
  estimatedDuration: {
    type: String,
    required: [true, 'La duree estimee est requise']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mise a jour automatique de updatedAt
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
