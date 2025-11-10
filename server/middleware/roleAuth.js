import { protect } from './auth.js';

// Middleware pour vérifier si l'utilisateur est super admin
export const protectAdmin = async (req, res, next) => {
  try {
    // D'abord appliquer la protection standard
    await protect(req, res, async () => {
      // Vérifier si l'utilisateur est super admin
      if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ 
          message: 'Accès refusé. Seul le super admin peut accéder à cette ressource.',
          userRole: req.user?.role || 'unknown'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Erreur dans protectAdmin:', error);
    res.status(401).json({ message: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier si l'utilisateur est admin ou super admin
export const protectAdminRole = async (req, res, next) => {
  try {
    await protect(req, res, async () => {
      if (!req.user || (req.user.role !== 'superadmin' && req.user.role !== 'admin')) {
        return res.status(403).json({ 
          message: 'Accès refusé. Vous devez être administrateur.',
          userRole: req.user?.role || 'unknown'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Erreur dans protectAdminRole:', error);
    res.status(401).json({ message: 'Erreur d\'authentification' });
  }
};
