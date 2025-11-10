import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/tokenUtils.js';

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    // Valider les données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, universityYear } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password,
      universityYear,
      authType: 'local'
    });

    if (user) {
      const token = generateToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        universityYear: user.universityYear,
        authType: user.authType,
        role: user.role,
        token,
        refreshToken
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    // Valider les données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Erreur de validation', errors: errors.array() });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le type d'authentification et le mot de passe
    if (user.authType !== 'local') {
      return res.status(401).json({ message: 'Cet email est associé à une authentification OAuth. Utilisez votre authentification ' + user.authType });
    }

    // Comparer les mots de passe
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer les tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      universityYear: user.universityYear,
      authType: user.authType,
      role: user.role,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir le profil de l'utilisateur
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.universityYear = req.body.universityYear || user.universityYear;
      
      // Mettre à jour le mot de passe seulement s'il est fourni
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        universityYear: updatedUser.universityYear,
        authType: updatedUser.authType,
        role: updatedUser.role,
        token: generateToken(updatedUser._id, updatedUser.role)
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rafraîchir le token d'accès
// @route   POST /api/users/refresh-token
// @access  Public
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }

    const { verifyRefreshToken } = await import('../utils/tokenUtils.js');
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const newAccessToken = generateToken(user._id, user.role);

    res.json({
      token: newAccessToken,
      refreshToken
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
