import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { protectAdmin, protectSuperAdmin } from '../middleware/roleAuth.js';
import {
  createComment,
  getPublicComments,
  getPendingComments,
  approveComment,
  rejectComment,
  deleteComment,
  getUserComments,
  deleteOwnComment
} from '../controllers/commentController.js';

const router = express.Router();

// Validation rules
const commentValidation = [
  body('text')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Le commentaire doit contenir entre 10 et 500 caracteres'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit etre entre 1 et 5')
];

const rejectValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La raison du rejet ne peut pas depasser 200 caracteres')
];

// Public routes
router.get('/public', getPublicComments);

// Protected routes (User)
router.post('/', protect, commentValidation, createComment);
router.get('/my-comments', protect, getUserComments);
router.delete('/:id', protect, deleteOwnComment);

// Admin routes
router.get('/admin/pending', protect, protectAdmin, getPendingComments);
router.put('/:id/approve', protect, protectAdmin, approveComment);
router.put('/:id/reject', protect, protectAdmin, rejectValidation, rejectComment);
router.delete('/admin/:id', protect, protectAdmin, deleteComment);

export default router;
