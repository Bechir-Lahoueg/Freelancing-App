import Invoice from '../models/Invoice.js';
import TaskRequest from '../models/TaskRequest.js';

// @desc    Creer une nouvelle facture
// @route   POST /api/invoices
// @access  Private
export const createInvoice = async (req, res) => {
  try {
    const { requestId, amount } = req.body;

    // Verifier que la tache existe et appartient a l'utilisateur
    const task = await TaskRequest.findById(requestId);
    
    if (!task) {
      return res.status(404).json({ message: 'Tache non trouvee' });
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorise' });
    }

    // Creer la facture
    const invoice = await Invoice.create({
      requestId,
      userId: req.user._id,
      amount,
      taxAmount: Math.round(amount * 0.19), // TVA 19%
      totalAmount: Math.round(amount * 1.19)
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les factures de l'utilisateur
// @route   GET /api/invoices
// @access  Private
export const getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .populate('requestId', 'title taskType status')
      .sort({ date: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir une facture specifique
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('requestId', 'title taskType status description')
      .populate('userId', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvee' });
    }

    // Verifier que la facture appartient a l'utilisateur
    if (invoice.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorise' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre a jour le statut de paiement
// @route   PUT /api/invoices/:id/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvee' });
    }

    // Verifier que la facture appartient a l'utilisateur
    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorise' });
    }

    invoice.paymentStatus = req.body.paymentStatus || invoice.paymentStatus;
    invoice.paymentMethod = req.body.paymentMethod || invoice.paymentMethod;
    
    if (req.body.paymentStatus === 'paid') {
      invoice.paidAt = Date.now();
    }

    const updatedInvoice = await invoice.save();

    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
