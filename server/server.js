import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import createSuperAdmin from './utils/createSuperAdmin.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Import des routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// Connexion à MongoDB et création du super admin
const initializeApp = async () => {
  await connectDB();
  // Attendre 5 secondes après la connexion avant de créer le super admin
  setTimeout(async () => {
    try {
      await createSuperAdmin();
    } catch (error) {
      console.error('❌ Erreur initialization:', error.message);
    }
  }, 5000);
};

initializeApp();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Mousaada est en ligne !',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      tasks: '/api/tasks',
      invoices: '/api/invoices'
    }
  });
});

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);

// Middleware de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

// Initialiser l'application (connexion DB + création super admin)
initializeApp();

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}\n`);
});
