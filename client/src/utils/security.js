/**
 * Configuration de sécurité pour le frontend
 * Prévient l'exposition d'informations sensibles
 */

// En production, désactiver complètement les outils de développement
if (import.meta.env.PROD) {
  // Désactiver le click droit (optionnel, peut être gênant pour les utilisateurs)
  // document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Désactiver certains raccourcis clavier de debug
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      return false;
    }
  });

  // Nettoyer le localStorage des tokens expirés régulièrement
  setInterval(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Vérifier si le token est expiré (basé sur JWT)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      // Ignorer silencieusement les erreurs
    }
  }, 60000); // Vérifier chaque minute
}

// Protection contre l'injection de scripts
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Vérifier si l'environnement est sécurisé
export const isSecureContext = () => {
  return window.isSecureContext || location.protocol === 'https:';
};

// Masquer les données sensibles pour l'affichage
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || typeof data !== 'string') return data;
  
  if (data.length <= visibleChars) return '*'.repeat(data.length);
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.max(0, data.length - visibleChars));
  return masked + visible;
};

// Valider les URLs pour prévenir les attaques
export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export default {
  sanitizeInput,
  isSecureContext,
  maskSensitiveData,
  isValidUrl
};
