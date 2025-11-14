import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  reorderCategories
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes (Admin/SuperAdmin only)
router.post(
  '/',
  authenticate,
  authorize('superadmin', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise'),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('order').optional().isInt({ min: 0 })
  ],
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  deleteCategory
);

router.patch(
  '/:id/toggle',
  authenticate,
  authorize('superadmin', 'admin'),
  toggleCategory
);

router.put(
  '/reorder',
  authenticate,
  authorize('superadmin', 'admin'),
  reorderCategories
);

export default router;
