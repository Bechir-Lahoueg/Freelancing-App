import express from 'express';
import { body, validationResult } from 'express-validator';
import { protectAdmin, protectSuperAdmin } from '../middleware/roleAuth.js';
import User from '../models/User.js';
import TaskRequest from '../models/TaskRequest.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Invoice from '../models/Invoice.js';
import Category from '../models/Category.js';
import SiteStats from '../models/SiteStats.js';
import PartnerRequest from '../models/PartnerRequest.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryConfig from '../config/cloudinary.js';

// Configuration multer pour Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Freelance app/category',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'category-' + uniqueSuffix;
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

const router = express.Router();

// ============================================
// 🔐 SUPER ADMIN MANAGEMENT
// ============================================

// @route   POST /api/admin/superadmins
// @desc    Créer un nouveau super admin
// @access  Private (Super Admin Only)
router.post(
  '/superadmins',
  protectSuperAdmin,
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit faire au moins 6 caractères')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Vérifier si l'email existe déjà
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Créer le super admin
      const newSuperAdmin = await User.create({
        name,
        email,
        password,
        role: 'superadmin',
        authType: 'local'
      });

      res.status(201).json({
        message: 'Super admin créé avec succès',
        _id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
        role: newSuperAdmin.role
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   GET /api/admin/superadmins
// @desc    Obtenir tous les super admins
// @access  Private (Super Admin)
router.get('/superadmins', protectAdmin, async (req, res) => {
  try {
    const superAdmins = await User.find({ role: 'superadmin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(superAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/superadmins/:id
// @desc    Supprimer un super admin
// @access  Private (Super Admin Only)
router.delete('/superadmins/:id', protectSuperAdmin, async (req, res) => {
  try {
    const superAdmin = await User.findById(req.params.id);

    if (!superAdmin || superAdmin.role !== 'superadmin') {
      return res.status(404).json({ message: 'Super admin non trouvé' });
    }

    // Empêcher la suppression si c'est le dernier super admin
    const superAdminCount = await User.countDocuments({ role: 'superadmin' });
    if (superAdminCount <= 1) {
      return res.status(403).json({ 
        message: 'Impossible de supprimer le dernier super admin' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Super admin supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// 📂 CATEGORY MANAGEMENT
// ============================================

// @route   POST /api/admin/categories
// @desc    Créer une nouvelle catégorie avec image
// @access  Private (Admin & Super Admin)
router.post(
  '/categories',
  protectAdmin,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Le nom de la catégorie est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise'),
    body('icon').optional().trim(),
    body('color').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, icon, color } = req.body;

      console.log('📸 Full req.file object:', JSON.stringify(req.file, null, 2));

      // Vérifier si le nom existe déjà
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(400).json({ message: 'Cette catégorie existe déjà' });
      }

      // Créer le slug
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      // Récupérer l'URL de l'image depuis Cloudinary
      // multer-storage-cloudinary retourne la propriété 'path' avec l'URL complète
      let imageUrl = null;
      if (req.file) {
        // Essayer différentes propriétés pour obtenir l'URL
        imageUrl = req.file.secure_url || req.file.path || req.file.url;
        console.log('🔗 Resolved image URL:', imageUrl);
        console.log('📦 req.file properties:', Object.keys(req.file));
      }

      // Créer la catégorie
      const newCategory = await Category.create({
        name,
        slug,
        description,
        icon: icon || '📋',
        color: color || '#3B82F6',
        image: imageUrl,
        createdBy: req.user._id,
        isActive: true,
        order: 0
      });

      console.log('✅ Category created:', newCategory);

      res.status(201).json({
        message: 'Catégorie créée avec succès',
        category: newCategory
      });
    } catch (error) {
      console.error('❌ Error creating category:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   GET /api/admin/categories
// @desc    Obtenir toutes les catégories
// @access  Private (Admin)
router.get('/categories', protectAdmin, async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Mettre à jour une catégorie
// @access  Private (Admin)
router.put(
  '/categories/:id',
  protectAdmin,
  upload.single('image'),
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, icon, color, isActive, order } = req.body;
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      // Mettre à jour les champs
      if (name) {
        category.name = name;
        category.slug = name.toLowerCase().replace(/\s+/g, '-');
      }
      if (description) category.description = description;
      if (icon) category.icon = icon;
      if (color) category.color = color;
      if (typeof isActive !== 'undefined') category.isActive = isActive;
      if (order !== undefined) category.order = order;

      // Gérer l'image depuis Cloudinary
      if (req.file) {
        // Supprimer l'ancienne image de Cloudinary si elle existe
        if (category.image) {
          try {
            // Extraire le public_id depuis l'URL Cloudinary
            const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error('Erreur suppression ancienne image Cloudinary:', error);
          }
        }
        // Utiliser la nouvelle image uploadée
        category.image = req.file.secure_url;
      }

      await category.save();

      res.json({
        message: 'Catégorie mise à jour avec succès',
        category
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE /api/admin/categories/:id
// @desc    Supprimer une catégorie
// @access  Private (Admin)
router.delete('/categories/:id', protectAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Supprimer l'image du serveur
    if (category.image) {
      const imagePath = path.join(__dirname, `..${category.image}`);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Erreur suppression image:', err);
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/categories/reorder
// @desc    Réorganiser les catégories
// @access  Private (Admin)
router.put('/categories-reorder', protectAdmin, async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, order }

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Format invalide' });
    }

    // Mettre à jour l'ordre de chaque catégorie
    for (const cat of categories) {
      await Category.findByIdAndUpdate(cat.id, { order: cat.order });
    }

    res.json({ message: 'Ordre des catégories mis à jour' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Obtenir les statistiques de l'application
// @access  Private (Super Admin)
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalSuperAdmins = await User.countDocuments({ role: 'superadmin' });
    
    const totalTasks = await TaskRequest.countDocuments();
    const pendingTasks = await TaskRequest.countDocuments({ status: 'pending' });
    const completedTasks = await TaskRequest.countDocuments({ status: 'completed' });
    
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ paymentStatus: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ paymentStatus: 'pending' });

    // Calculer le revenu total
    const invoiceData = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    const totalRevenue = invoiceData[0]?.totalAmount || 0;
    const paidRevenue = invoiceData[0]?.paidAmount || 0;

    res.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        superAdmins: totalSuperAdmins
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks
      },
      invoices: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices
      },
      revenue: {
        total: totalRevenue,
        paid: paidRevenue,
        pending: totalRevenue - paidRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Obtenir tous les utilisateurs
// @access  Private (Super Admin)
router.get('/users', protectAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Obtenir les détails d'un utilisateur
// @access  Private (Super Admin)
router.get('/users/:id', protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Obtenir les statistiques de cet utilisateur
    const userTasks = await TaskRequest.countDocuments({ userId: user._id });
    const userInvoices = await Invoice.countDocuments({ userId: user._id });
    const userRevenue = await Invoice.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      user,
      stats: {
        tasks: userTasks,
        invoices: userInvoices,
        revenue: userRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Supprimer un utilisateur
// @access  Private (Super Admin)
router.delete('/users/:id', protectAdmin, async (req, res) => {
  try {
    // Vérifier qu'on ne supprime pas le super admin
    const user = await User.findById(req.params.id);
    
    if (user.role === 'superadmin') {
      return res.status(403).json({ 
        message: 'Impossible de supprimer le super admin' 
      });
    }

    // Supprimer l'utilisateur et ses données associées
    await TaskRequest.deleteMany({ userId: req.params.id });
    await Invoice.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Modifier le rôle d'un utilisateur
// @access  Private (Super Admin)
router.put('/users/:id/role', protectAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// 📂 PUBLIC CATEGORY ROUTES
// ============================================

// @route   GET /api/admin/categories/list
// @desc    Obtenir toutes les catégories publiques
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('_id name slug description icon color image order')
      .sort({ order: 1, createdAt: -1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/categories/:id
// @desc    Obtenir une catégorie spécifique avec ses questions
// @access  Public
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// 📋 ADMIN TASK MANAGEMENT ROUTES
// ============================================

// @route   GET /api/admin/services/by-category/:categoryId
// @desc    Obtenir tous les services d'une catégorie (admin)
// @access  Private (Admin/SuperAdmin)
router.get('/services/by-category/:categoryId', protectAdmin, async (req, res) => {
  try {
    const Service = (await import('../models/Service.js')).default;
    const services = await Service.find({ categoryId: req.params.categoryId })
      .sort({ order: 1, createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/services
// @desc    Créer un nouveau service (admin)
// @access  Private (Admin/SuperAdmin)
router.post('/services', protectAdmin, async (req, res) => {
  try {
    const Service = (await import('../models/Service.js')).default;
    const { categoryId, name, description, icon, image, questions, basePrice, estimatedDuration } = req.body;

    const service = await Service.create({
      categoryId,
      name,
      description,
      icon: icon || '📋',
      image,
      questions: questions || [],
      basePrice: basePrice || 0,
      estimatedDuration,
      createdBy: req.user._id,
      isActive: true
    });

    await service.populate('categoryId', 'name icon');

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/services/:id
// @desc    Mettre à jour un service (admin)
// @access  Private (Admin/SuperAdmin)
router.put('/services/:id', protectAdmin, async (req, res) => {
  try {
    const Service = (await import('../models/Service.js')).default;
    const { name, description, icon, image, questions, basePrice, estimatedDuration, isActive } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, image, questions, basePrice, estimatedDuration, isActive },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon');

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/services/:id
// @desc    Supprimer un service (admin)
// @access  Private (Admin/SuperAdmin)
router.delete('/services/:id', protectAdmin, async (req, res) => {
  try {
    const Service = (await import('../models/Service.js')).default;
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/tasks/all
// @desc    Obtenir toutes les tâches (admin)
// @access  Private (Admin/SuperAdmin)
router.get('/tasks/all', protectAdmin, async (req, res) => {
  try {
    const tasks = await TaskRequest.find()
      .populate('userId', 'name email')
      .populate('serviceId', 'name icon')
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/tasks/:id/approve
// @desc    Approuver une tâche et créer une conversation
// @access  Private (Admin/SuperAdmin)
router.put('/tasks/:id/approve', protectAdmin, async (req, res) => {
  try {
    const task = await TaskRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date() },
      { new: true }
    )
      .populate('serviceId', 'name icon')
      .populate('categoryId', 'name icon')
      .populate('userId', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Créer automatiquement une conversation pour cette tâche
    let conversation = await Conversation.findOne({ taskRequestId: task._id });

    if (!conversation) {
      // Liste des agents disponibles
      const availableAgents = [
        'Sami Slimani',
        'Hassen Bouallegue',
        'Mariem Zaghouani',
        'Arij Wayli',
        'Rami Grami'
      ];

      // Sélectionner un agent aléatoirement
      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];

      // Générer un code de conversation unique (format: CONV-XXXXXX)
      const conversationCode = 'CONV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      conversation = await Conversation.create({
        conversationCode,
        assignedAgent: {
          name: randomAgent
        },
        taskRequestId: task._id,
        participants: [
          {
            userId: task.userId._id,
            role: 'user'
          },
          {
            userId: req.user._id,
            role: req.user.role
          }
        ],
        unreadCount: {
          [task.userId._id]: 1, // L'utilisateur a 1 message non lu
          [req.user._id]: 0
        }
      });

      // Créer deux messages système : un pour le client et un pour l'admin
      
      // Message pour le CLIENT
      const userMessage = await Message.create({
        conversationId: conversation._id,
        senderId: req.user._id,
        recipientId: task.userId._id, // Destinataire spécifique
        content: `🎉 Votre demande "${task.title}" a été approuvée !\n\n📋 Code de discussion: ${conversationCode}\n👤 Vous êtes mis en relation avec: ${randomAgent}\n\n💬 Vous pouvez maintenant discuter avec notre équipe.\n📌 Conservez ce code pour référence future.`,
        messageType: 'system'
      });

      // Message pour l'ADMIN
      const adminMessage = await Message.create({
        conversationId: conversation._id,
        senderId: req.user._id,
        recipientId: req.user._id, // Destinataire = admin
        content: `✅ Nouvelle conversation initiée\n\n👤 Client: ${task.userId.name}\n📧 Email: ${task.userId.email}\n📋 Code: ${conversationCode}\n🎯 Agent assigné: ${randomAgent}\n📝 Demande: "${task.title}"\n\n💼 Vous pouvez maintenant assister le client.`,
        messageType: 'system'
      });

      conversation.lastMessage = {
        content: `Conversation créée pour "${task.title}"`,
        senderId: req.user._id,
        timestamp: userMessage.createdAt
      };
      await conversation.save();

      // Émettre une notification via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('conversation:created', {
          userId: task.userId._id,
          conversation: conversation
        });
      }
    }

    res.json({ 
      message: 'Tâche approuvée et conversation créée', 
      task,
      conversationId: conversation._id,
      conversationCode: conversation.conversationCode,
      assignedAgent: conversation.assignedAgent.name
    });
  } catch (error) {
    console.error('❌ Erreur approbation tâche:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/tasks/:id/reject
// @desc    Rejeter une tâche
// @access  Private (Admin/SuperAdmin)
router.put('/tasks/:id/reject', protectAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const task = await TaskRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected', 
        rejectionReason: reason || 'Non spécifiée',
        rejectedAt: new Date()
      },
      { new: true }
    )
      .populate('serviceId', 'name icon')
      .populate('categoryId', 'name icon');

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json({ message: 'Tâche rejetée', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// 💬 CONVERSATION MANAGEMENT
// ============================================

// @route   POST /api/admin/conversations/:conversationId/leave
// @desc    Admin quitte la conversation (stoppe la conversation)
// @access  Private (Admin)
router.post('/conversations/:conversationId/leave', protectAdmin, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier que l'utilisateur est admin dans cette conversation
    const isAdmin = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString() && 
           (p.role === 'admin' || p.role === 'superadmin')
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Fermer la conversation
    conversation.status = 'closed';
    conversation.closedBy = {
      userId: req.user._id,
      reason: 'admin_left',
      closedAt: new Date()
    };
    await conversation.save();

    // Créer un message système
    const systemMessage = await Message.create({
      conversationId,
      content: `L'administrateur a quitté la conversation. Cette conversation est maintenant fermée.`,
      messageType: 'system',
      senderId: req.user._id
    });

    // Émettre via Socket.IO
    if (req.app.get('io')) {
      req.app.get('io').to(conversationId).emit('conversation:closed', {
        conversationId,
        reason: 'admin_left',
        message: systemMessage
      });
    }

    res.json({ 
      message: 'Conversation fermée avec succès',
      conversation 
    });
  } catch (error) {
    console.error('Erreur lors de la fermeture de la conversation:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/conversations/:conversationId/complete
// @desc    Marquer la tâche comme terminée
// @access  Private (Admin)
router.post('/conversations/:conversationId/complete', protectAdmin, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { action } = req.body; // 'keep_open' ou 'close_conversation'
    
    const conversation = await Conversation.findById(conversationId)
      .populate('taskRequestId');
      
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier que l'utilisateur est admin dans cette conversation
    const isAdmin = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString() && 
           (p.role === 'admin' || p.role === 'superadmin')
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Marquer la tâche comme terminée
    conversation.taskCompleted = true;
    conversation.completedAction = action;

    // Mettre à jour le statut de la TaskRequest
    if (conversation.taskRequestId) {
      await TaskRequest.findByIdAndUpdate(conversation.taskRequestId._id, {
        status: 'completed'
      });
    }

    // Si l'action est de fermer la conversation
    if (action === 'close_conversation') {
      conversation.status = 'completed';
      conversation.closedBy = {
        userId: req.user._id,
        reason: 'task_completed',
        closedAt: new Date()
      };
    }

    await conversation.save();

    // Incrémenter le compteur de projets complétés
    let siteStats = await SiteStats.findOne();
    if (!siteStats) {
      siteStats = await SiteStats.create({ projectsCompleted: 1 });
    } else {
      siteStats.projectsCompleted += 1;
      siteStats.lastUpdated = new Date();
      await siteStats.save();
    }

    // Créer un message système
    let systemMessageContent = `✅ La tâche a été marquée comme terminée par l'administrateur.`;
    if (action === 'close_conversation') {
      systemMessageContent += ` Cette conversation est maintenant fermée.`;
    } else {
      systemMessageContent += ` La conversation reste ouverte pour d'éventuels échanges.`;
    }

    const systemMessage = await Message.create({
      conversationId,
      content: systemMessageContent,
      messageType: 'system',
      senderId: req.user._id
    });

    // Émettre via Socket.IO
    if (req.app.get('io')) {
      req.app.get('io').to(conversationId).emit('task:completed', {
        conversationId,
        action,
        taskCompleted: true,
        message: systemMessage
      });
    }

    res.json({ 
      message: 'Tâche marquée comme terminée',
      conversation,
      projectsCompleted: true // Pour incrémenter le compteur
    });
  } catch (error) {
    console.error('Erreur lors de la complétion de la tâche:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/site-stats
// @desc    Obtenir les statistiques du site
// @access  Public (pour afficher sur le site)
router.get('/site-stats', async (req, res) => {
  try {
    let siteStats = await SiteStats.findOne();
    if (!siteStats) {
      siteStats = await SiteStats.create({ 
        projectsCompleted: 0,
        totalUsers: await User.countDocuments(),
        totalTasks: await TaskRequest.countDocuments()
      });
    }

    res.json(siteStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// 🤝 PARTNER REQUESTS MANAGEMENT
// ============================================

// @route   GET /api/admin/partner-requests
// @desc    Obtenir toutes les demandes de partenariat
// @access  Private (Admin)
router.get('/partner-requests', protectAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await PartnerRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    res.json(requests);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/partner-requests/:id
// @desc    Obtenir une demande de partenariat spécifique
// @access  Private (Admin)
router.get('/partner-requests/:id', protectAdmin, async (req, res) => {
  try {
    const request = await PartnerRequest.findById(req.params.id)
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    res.json(request);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/partner-requests/:id/approve
// @desc    Approuver une demande de partenariat
// @access  Private (Admin)
router.put('/partner-requests/:id/approve', protectAdmin, async (req, res) => {
  try {
    const { notes } = req.body;

    const request = await PartnerRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cette demande a déjà été traitée' 
      });
    }

    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (notes) request.notes = notes;

    await request.save();

    res.json({ 
      message: 'Demande approuvée avec succès',
      request 
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/partner-requests/:id/reject
// @desc    Rejeter une demande de partenariat
// @access  Private (Admin)
router.put('/partner-requests/:id/reject', protectAdmin, async (req, res) => {
  try {
    const { reason, notes } = req.body;

    const request = await PartnerRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cette demande a déjà été traitée' 
      });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (reason) request.rejectionReason = reason;
    if (notes) request.notes = notes;

    await request.save();

    res.json({ 
      message: 'Demande rejetée',
      request 
    });
  } catch (error) {
    console.error('Erreur lors du rejet:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/partner-requests/:id
// @desc    Supprimer une demande de partenariat
// @access  Private (Super Admin)
router.delete('/partner-requests/:id', protectSuperAdmin, async (req, res) => {
  try {
    const request = await PartnerRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    // Supprimer le CV de Cloudinary si présent
    if (request.cvUrl) {
      const publicId = request.cvUrl.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (err) {
        console.error('Erreur suppression CV Cloudinary:', err);
      }
    }

    await PartnerRequest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
