import { protect } from './auth.js';

// Middleware pour verifier si l'utilisateur est super admin
export const protectAdmin = async (req, res, next) => {
  // D'abord appliquer la protection standard
  await protect(req, res, () => {
    // Verifier si l'utilisateur est super admin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Acces refuse. Seul le super admin peut acceder a cette ressource.' 
      });
    }
    next();
  });
};

// Middleware pour verifier si l'utilisateur est SUPER ADMIN uniquement
export const protectSuperAdmin = async (req, res, next) => {
  // D'abord appliquer la protection standard
  await protect(req, res, () => {
    // Verifier si l'utilisateur est super admin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Acces refuse. Seul le super admin peut acceder a cette ressource.' 
      });
    }
    next();
  });
};

// Middleware pour verifier si l'utilisateur est admin ou super admin
export const protectAdminRole = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Acces refuse. Vous devez etre administrateur.' 
      });
    }
    next();
  });
};

// Middleware generique pour verifier les roles autorises
export const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifie' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acces refuse. Roles autorises: ${roles.join(', ')}` 
      });
    }

    next();
  };
};
