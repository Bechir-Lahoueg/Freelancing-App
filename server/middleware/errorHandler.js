// Middleware de gestion d'erreurs global
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// Middleware pour les routes non trouvees
export const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvee - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
