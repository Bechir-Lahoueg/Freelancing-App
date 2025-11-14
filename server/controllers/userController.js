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
    console.log('🔐 [loginUser] Starting login process');
    
    // Valider les données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [loginUser] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('📧 [loginUser] Login attempt for email:', email);

    // Trouver l'utilisateur
    console.log('🔍 [loginUser] Searching for user...');
    const user = await User.findOne({ email });
    console.log('✅ [loginUser] User search completed:', user ? 'User found' : 'User not found');

    if (user && user.authType === 'local') {
      console.log('🔐 [loginUser] Comparing passwords...');
      const passwordMatch = await user.comparePassword(password);
      console.log('✅ [loginUser] Password comparison completed:', passwordMatch ? 'Match' : 'No match');
      
      if (passwordMatch) {
        console.log('🔑 [loginUser] Generating tokens...');
        const token = generateToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);
        console.log('✅ [loginUser] Tokens generated');

        return res.json({
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
    }
    
    console.log('❌ [loginUser] Invalid credentials');
    res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  } catch (error) {
    console.error('❌ [loginUser] Error:', error);
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
