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
import healthRoutes from './routes/healthRoutes.js';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// Creer le serveur HTTP
const httpServer = createServer(app);

// Configurer Socket.IO avec CORS flexible
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
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

// Connexion a MongoDB et creation du super admin
const initializeApp = async () => {
  await connectDB();
  // Attendre 5 secondes apres la connexion avant de creer le super admin
  setTimeout(async () => {
    try {
      await createSuperAdmin();
    } catch (error) {
      console.error('❌ Erreur initialization:', error.message);
    }
  }, 5000);
};

initializeApp();

// Configuration CORS plus flexible
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requetes sans origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisees
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://freelancing-app-mdgw.onrender.com'
    ].filter(Boolean);
    
    // En developpement, autoriser toutes les origines localhost
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));

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
app.use('/api/health', healthRoutes);

// Socket.IO - Gestion des connexions en temps reel
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
    console.log(`👋 Socket ${socket.id} a quitte la conversation ${conversationId}`);
  });

  // Envoyer un message
  socket.on('message:send', (data) => {
    console.log('📨 Message envoye:', data);
    // Emettre le message a tous les membres de la conversation
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

  // Deconnexion
  socket.on('disconnect', () => {
    console.log('🔌 Deconnexion Socket.IO:', socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    }
  });
});

// Middleware de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Demarrer le serveur
const PORT = process.env.PORT || 5000;

// Initialiser l'application (connexion DB + creation super admin)
initializeApp();

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Serveur demarre sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💬 Socket.IO active pour le chat en temps reel\n`);
  
  // Definir Socket.IO globalement apres le demarrage
  setSocketIO(io);
});
