import express from 'express';
import { body } from 'express-validator';
import {
  createTaskRequest,
  getUserTasks,
  getTaskById,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes sont protegees
router.use(protect);

// @route   POST /api/tasks
// @desc    Creer une nouvelle demande de tache
// @access  Private
router.post('/', [
  body('serviceId').notEmpty().withMessage('Le service est requis'),
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('description').notEmpty().withMessage('La description est requise')
], createTaskRequest);

// @route   GET /api/tasks
// @desc    Obtenir toutes les taches de l'utilisateur
// @access  Private
router.get('/', getUserTasks);

// @route   GET /api/tasks/:id
// @desc    Obtenir une tache specifique
// @access  Private
router.get('/:id', getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Mettre a jour le statut d'une tache
// @access  Private
router.put('/:id', updateTaskStatus);

// @route   DELETE /api/tasks/:id
// @desc    Supprimer une tache
// @access  Private
router.delete('/:id', deleteTask);

export default router;
