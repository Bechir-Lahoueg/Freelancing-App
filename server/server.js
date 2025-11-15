import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// Créer le serveur HTTP
const httpServer = createServer(app);

// Configurer Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Rendre io accessible dans les routes
app.set('io', io);

// Variable globale pour Socket.IO (accessible dans tous les modules)
export let socketIO = null;
export const setSocketIO = (ioInstance) => {
  socketIO = ioInstance;
};

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

// Servir les fichiers statiques (images, etc.)
app.use('/uploads', express.static('uploads'));

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
    message: '🚀 API Do It est en ligne !',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      tasks: '/api/tasks',
      invoices: '/api/invoices'
    }
  });
});

// Add request logging middleware for debugging
app.use((req, res, next) => {
  try {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
    }
  } catch (e) {
    console.error('Logging error:', e.message);
  }
  next();
});

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/partner', partnerRoutes);

// Socket.IO - Gestion des connexions en temps réel
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🔌 Nouvelle connexion Socket.IO:', socket.id);

  // Quand un utilisateur se connecte
  socket.on('user:online', (userId) => {
    console.log('👤 Utilisateur en ligne:', userId);
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    // Rejoindre une room avec son userId pour les notifications
    socket.join(userId);
    // Notifier les autres utilisateurs
    io.emit('user:status', { userId, status: 'online' });
  });

  // Rejoindre une conversation
  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 Socket ${socket.id} a rejoint la conversation ${conversationId}`);
  });

  // Quitter une conversation
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(conversationId);
    console.log(`👋 Socket ${socket.id} a quitté la conversation ${conversationId}`);
  });

  // Envoyer un message
  socket.on('message:send', (data) => {
    console.log('📨 Message envoyé:', data);
    // Émettre le message à tous les membres de la conversation
    io.to(data.conversationId).emit('message:received', data);
  });

  // Marquer un message comme lu
  socket.on('message:read', (data) => {
    io.to(data.conversationId).emit('message:read-status', data);
  });

  // Notification de typing
  socket.on('typing:start', (data) => {
    socket.to(data.conversationId).emit('user:typing', {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(data.conversationId).emit('user:stop-typing', {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('🔌 Déconnexion Socket.IO:', socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    }
  });
});

// Middleware de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

// Initialiser l'application (connexion DB + création super admin)
initializeApp();

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💬 Socket.IO activé pour le chat en temps réel\n`);
  
  // Définir Socket.IO globalement après le démarrage
  setSocketIO(io);
});
