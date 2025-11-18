import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  refreshAccessToken
} from '../controllers/userController.js';
import { 
  getUserStats, 
  getUserHistory 
} from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres'),
  body('institution').notEmpty().withMessage('L\'etablissement est requis'),
  body('universityYear').notEmpty().withMessage('L\'annee universitaire est requise')
], registerUser);

// @route   POST /api/users/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
], loginUser);

// @route   GET /api/users/profile
// @desc    Obtenir le profil de l'utilisateur
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Mettre a jour le profil
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/users/refresh-token
// @desc    Rafraichir le token d'acces
// @access  Public
router.post('/refresh-token', refreshAccessToken);

// @route   GET /api/users/stats/personal
// @desc    Obtenir les statistiques personnelles
// @access  Private
router.get('/stats/personal', protect, getUserStats);

// @route   GET /api/users/history
// @desc    Obtenir l'historique complet
// @access  Private
router.get('/history', protect, getUserHistory);

export default router;
