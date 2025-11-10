import express from 'express';
import { protectAdmin } from '../middleware/roleAuth.js';
import User from '../models/User.js';
import TaskRequest from '../models/TaskRequest.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

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

export default router;
