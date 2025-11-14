import express from 'express';
import { body, validationResult } from 'express-validator';
import { protectAdmin, protectSuperAdmin } from '../middleware/roleAuth.js';
import User from '../models/User.js';
import TaskRequest from '../models/TaskRequest.js';
import Invoice from '../models/Invoice.js';
import Category from '../models/Category.js';
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

export default router;
