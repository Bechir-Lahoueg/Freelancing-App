import express from 'express';
import {
  createInvoice,
  getUserInvoices,
  getInvoiceById,
  updatePaymentStatus
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes sont protegees
router.use(protect);

// @route   POST /api/invoices
// @desc    Creer une nouvelle facture
// @access  Private
router.post('/', createInvoice);

// @route   GET /api/invoices
// @desc    Obtenir toutes les factures de l'utilisateur
// @access  Private
router.get('/', getUserInvoices);

// @route   GET /api/invoices/:id
// @desc    Obtenir une facture specifique
// @access  Private
router.get('/:id', getInvoiceById);

// @route   PUT /api/invoices/:id/payment
// @desc    Mettre a jour le statut de paiement
// @access  Private
router.put('/:id/payment', updatePaymentStatus);

export default router;
