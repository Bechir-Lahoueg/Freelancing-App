import mongoose from 'mongoose';

const partnerRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    trim: true,
    lowercase: true
  },
  age: {
    type: Number,
    required: [true, 'L\'âge est requis']
  },
  personality: {
    type: String,
    enum: ['Calme et organisé', 'Créatif et innovateur', 'Leader et motivé', 'Sérieux et rigoureux', 'Flexible et sociable'],
    required: [true, 'La personnalité est requise']
  },
  domain: {
    type: String,
    enum: ['Développement Web', 'Développement Mobile', 'Encadrant / Enseignant PFE', 'Designer UI/UX', 'Support Technique', 'Autre'],
    required: [true, 'Le domaine est requis']
  },
  experience: {
    type: String,
    required: [true, 'L\'expérience est requise']
  },
  pricingModel: {
    type: String,
    enum: ['Salaire mensuel', 'Prix par projet', 'Éducateur (prix par séance)'],
    required: [true, 'Le modèle de prix est requis']
  },
  priceValue: {
    type: String,
    required: [true, 'Le prix proposé est requis']
  },
  availability: {
    type: String
  },
  motivation: {
    type: String
  },
  message: {
    type: String
  },
  cvUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour rechercher rapidement
partnerRequestSchema.index({ email: 1 });
partnerRequestSchema.index({ status: 1 });
partnerRequestSchema.index({ createdAt: -1 });

const PartnerRequest = mongoose.model('PartnerRequest', partnerRequestSchema);

export default PartnerRequest;
