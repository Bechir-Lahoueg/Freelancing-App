import express from 'express';
import { body, validationResult } from 'express-validator';
import PartnerRequest from '../models/PartnerRequest.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { notifyPartnerRequest } from '../utils/notificationHelper.js';

const router = express.Router();

// Configuration multer pour Cloudinary (CV)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'do-it/categories', // Same folder as category images
    format: async (req, file) => 'pdf',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'cv-' + uniqueSuffix;
    },
    resource_type: 'raw'
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = file.mimetype === 'application/pdf' || 
                     file.mimetype === 'application/msword' || 
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, DOC et DOCX sont acceptés'));
    }
  }
});

// @route   POST /api/partner/submit
// @desc    Soumettre une demande de partenariat
// @access  Public
router.post(
  '/submit',
  upload.single('cv'),
  [
    body('fullName').trim().notEmpty().withMessage('Le nom complet est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('age').isInt({ min: 18, max: 100 }).withMessage('L\'âge doit être entre 18 et 100'),
    body('personality').notEmpty().withMessage('La personnalité est requise'),
    body('domain').notEmpty().withMessage('Le domaine est requis'),
    body('experience').notEmpty().withMessage('L\'expérience est requise'),
    body('pricingModel').notEmpty().withMessage('Le modèle de prix est requis'),
    body('priceValue').notEmpty().withMessage('Le prix proposé est requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        fullName,
        email,
        age,
        personality,
        domain,
        experience,
        pricingModel,
        priceValue,
        availability,
        motivation,
        message
      } = req.body;

      // Vérifier si une demande existe déjà pour cet email
      const existingRequest = await PartnerRequest.findOne({ 
        email, 
        status: 'pending' 
      });

      if (existingRequest) {
        return res.status(400).json({ 
          message: 'Vous avez déjà une demande en attente. Veuillez patienter.' 
        });
      }

      // Créer la demande
      const partnerRequest = await PartnerRequest.create({
        fullName,
        email,
        age,
        personality,
        domain,
        experience,
        pricingModel,
        priceValue,
        availability,
        motivation,
        message,
        cvUrl: req.file ? req.file.path : null
      });

      // Émettre notification aux admins via Socket.IO
      const io = req.app.get('io');
      if (io) {
        await notifyPartnerRequest(io, partnerRequest);
      }

      res.status(201).json({
        message: 'Votre demande a été soumise avec succès ! Nous vous contacterons bientôt.',
        requestId: partnerRequest._id
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la soumission de votre demande' 
      });
    }
  }
);

export default router;
