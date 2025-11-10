import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskRequest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer', 'cash'],
    default: 'card'
  },
  date: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  details: {
    type: String
  }
});

// Générer un numéro de facture unique
invoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
