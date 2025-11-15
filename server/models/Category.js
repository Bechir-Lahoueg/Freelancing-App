import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    unique: true,
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  icon: {
    type: String,
    default: '📋'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  image: {
    type: String,
    default: null
  },
  questions: [{
    id: String,
    label: String,
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'number', 'file'],
      default: 'text'
    },
    options: [String], // Pour select, multiselect, radio
    required: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    order: {
      type: Number,
      default: 0
    }
  }],
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
    ref: 'User',
    required: true
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

// Générer le slug avant la sauvegarde
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
