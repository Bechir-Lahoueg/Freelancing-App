/**
 * Système de logging sécurisé
 * En production, les logs ne seront pas affichés dans la console
 * pour éviter d'exposer des informations sensibles
 */

const isDevelopment = import.meta.env.MODE === 'development';

// Logger sécurisé - ne log que en développement
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
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
  }
};

// Pour la production, on peut envoyer les erreurs critiques à un service externe
export const logError = (error, context = {}) => {
  if (isDevelopment) {
    console.error('Error:', error, 'Context:', context);
  } else {
    // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    // Exemple: Sentry.captureException(error, { extra: context });
  }
};

export default logger;
