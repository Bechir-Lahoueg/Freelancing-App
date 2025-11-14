import jwt from 'jsonwebtoken';

// Générer un token JWT avec expiration
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'votre_secret_jwt_super_secure',
    { expiresIn: '7d' }
  );
};

// Générer un Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'votre_refresh_secret_super_secure',
    { expiresIn: '30d' }
  );
};

// Vérifier un token
export const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'votre_secret_jwt_super_secure'
    );
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

// Vérifier un Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'votre_refresh_secret_super_secure'
    );
  } catch (error) {
    throw new Error('Refresh token invalide ou expiré');
  }
};
