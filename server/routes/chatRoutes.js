import express from 'express';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  archiveConversation,
  searchConversationByCode
} from '../controllers/chatController.js';

const router = express.Router();

// Configuration Cloudinary pour les fichiers de chat
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determiner le type de ressource et le format
    let resourceType = 'auto';
    let folder = 'do-it/chat';
    
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary traite l'audio comme video
    } else {
      resourceType = 'raw'; // Pour PDF, documents, etc.
    }
    
    return {
      folder: folder,
      resource_type: resourceType,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'wav', 'avi', 'mov']
    };
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter images, videos, audio, PDF, documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mp3|wav|avi|mov/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = file.mimetype.match(/(image|video|audio|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporte'));
    }
  }
});

// Toutes les routes necessitent une authentification
router.use(protect);

// Routes pour les conversations
router.post('/conversations', createConversation);
router.get('/conversations', getUserConversations);
router.get('/conversations/search/:code', searchConversationByCode); // Avant :id pour eviter les conflits
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Determiner le type de message selon le MIME type
    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      messageType = 'audio';
    } else if (req.file.mimetype === 'application/pdf') {
      messageType = 'pdf';
    }

    res.json({
      success: true,
      file: {
        url: req.file.path,
        type: messageType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
  }
});
router.put('/conversations/:id/read', markMessagesAsRead);
router.put('/conversations/:id/archive', archiveConversation);

export default router;
