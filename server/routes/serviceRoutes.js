import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

// Routes publiques
router.get('/', getServices);
router.get('/:id', getServiceById);

// Routes protegees (Admin/SuperAdmin)
router.post(
  '/',
  protect,
  authorize('superadmin', 'admin'),
  [
    body('categoryId').notEmpty().withMessage('La categorie est requise'),
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise')
  ],
  createService
);

router.put(
  '/:id',
  protect,
  authorize('superadmin', 'admin'),
  updateService
);

router.delete(
  '/:id',
  protect,
  authorize('superadmin', 'admin'),
  deleteService
);

export default router;
