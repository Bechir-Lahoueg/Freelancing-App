import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware pour proteger les routes
export const protect = async (req, res, next) => {
  let token;

  // Verifier si le token existe dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Verifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Recuperer l'utilisateur (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouve' });
      }

      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return res.status(401).json({ message: 'Non autorise, token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorise, aucun token fourni' });
  }
};

// Generer un token JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Export authenticate as an alias for protect
export const authenticate = protect;
