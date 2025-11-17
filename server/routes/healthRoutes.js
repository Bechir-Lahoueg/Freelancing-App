import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Route de health check complète
router.get('/check', async (req, res) => {
  try {
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      
      // Vérification MongoDB
      database: {
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        name: mongoose.connection.name,
      },
      
      // Vérification des modèles
      models: {
        User: !!mongoose.models.User,
        TaskRequest: !!mongoose.models.TaskRequest,
        Category: !!mongoose.models.Category,
        Comment: !!mongoose.models.Comment,
        Notification: !!mongoose.models.Notification,
        Message: !!mongoose.models.Message,
        Conversation: !!mongoose.models.Conversation,
        PartnerRequest: !!mongoose.models.PartnerRequest,
      },
      
      // Vérification des fichiers critiques
      files: {
        controllers: fs.existsSync(path.join(__dirname, '../controllers')),
        models: fs.existsSync(path.join(__dirname, '../models')),
        routes: fs.existsSync(path.join(__dirname, '../routes')),
        config: fs.existsSync(path.join(__dirname, '../config')),
      },
      
      // Variables d'environnement critiques (masquées)
      config: {
        mongodbConfigured: !!process.env.MONGODB_URI,
        jwtConfigured: !!process.env.JWT_SECRET,
        cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
        googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
      
      // Statistiques
      stats: {
        totalUsers: await mongoose.models.User?.countDocuments() || 0,
        totalTasks: await mongoose.models.TaskRequest?.countDocuments() || 0,
        totalCategories: await mongoose.models.Category?.countDocuments() || 0,
        totalComments: await mongoose.models.Comment?.countDocuments() || 0,
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route simple de ping (ultra-léger pour UptimeRobot)
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Pong!',
    timestamp: new Date().toISOString()
  });
});

// Route encore plus légère pour UptimeRobot (sans JSON parsing)
router.get('/alive', (req, res) => {
  res.status(200).send('OK');
});

// Route avec vérification minimale de la DB
router.get('/status', (req, res) => {
  const isDBConnected = mongoose.connection.readyState === 1;
  res.status(isDBConnected ? 200 : 503).json({ 
    status: isDBConnected ? 'OK' : 'ERROR',
    db: isDBConnected ? 'Connected' : 'Disconnected',
    uptime: Math.floor(process.uptime())
  });
});

// Vérification de la base de données
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    
    res.status(200).json({
      status: states[dbState],
      state: dbState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
