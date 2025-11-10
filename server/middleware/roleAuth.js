import { protect } from './auth.js';

// Middleware pour vérifier si l'utilisateur est super admin
export const protectAdmin = async (req, res, next) => {
  // D'abord appliquer la protection standard
  await protect(req, res, () => {
    // Vérifier si l'utilisateur est super admin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Accès refusé. Seul le super admin peut accéder à cette ressource.' 
      });
    }
    next();
  });
};

// Middleware pour vérifier si l'utilisateur est admin ou super admin
export const protectAdminRole = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Accès refusé. Vous devez être administrateur.' 
      });
    }
    next();
  });
};
