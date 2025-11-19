/**
 * Système de logging sécurisé pour le backend
 * En production, ne pas exposer d'informations sensibles
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Liste des mots-clés sensibles à ne jamais logger
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apiKey',
  'authorization',
  'jwt',
  'refresh_token',
  'refreshToken',
  'credit_card',
  'ssn',
  'privateKey'
];

// Sanitize les objets pour retirer les données sensibles
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Logger sécurisé
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args.map(sanitizeData));
    }
  },
  
  error: (message, error) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // En production, logger seulement le message sans détails sensibles
      console.error(message);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Logger pour les requêtes HTTP (sans données sensibles)
  request: (req) => {
    if (isDevelopment) {
      const sanitizedBody = sanitizeData(req.body);
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
        body: sanitizedBody,
        query: req.query,
        params: req.params
      });
    }
  }
};

// Logger d'erreurs pour production (à connecter à un service externe)
export const logProductionError = (error, context = {}) => {
  // En production, envoyer à un service de monitoring
  // Exemple: Sentry, Winston, CloudWatch, etc.
  console.error('Production Error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...sanitizeData(context)
  });
};

export default logger;
