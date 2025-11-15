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

// Toutes les routes sont protégées
router.use(protect);

// @route   POST /api/tasks
// @desc    Créer une nouvelle demande de tâche
// @access  Private
router.post('/', [
  body('serviceId').notEmpty().withMessage('Le service est requis'),
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('description').notEmpty().withMessage('La description est requise')
], createTaskRequest);

// @route   GET /api/tasks
// @desc    Obtenir toutes les tâches de l'utilisateur
// @access  Private
router.get('/', getUserTasks);

// @route   GET /api/tasks/:id
// @desc    Obtenir une tâche spécifique
// @access  Private
router.get('/:id', getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Mettre à jour le statut d'une tâche
// @access  Private
router.put('/:id', updateTaskStatus);

// @route   DELETE /api/tasks/:id
// @desc    Supprimer une tâche
// @access  Private
router.delete('/:id', deleteTask);

export default router;
