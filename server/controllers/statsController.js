import TaskRequest from '../models/TaskRequest.js';
import Invoice from '../models/Invoice.js';

// @desc    Obtenir les statistiques personnelles de l'utilisateur
// @route   GET /api/users/stats/personal
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Compter les taches
    const totalTasks = await TaskRequest.countDocuments({ userId });
    const pendingTasks = await TaskRequest.countDocuments({ 
      userId, 
      status: 'pending' 
    });
    const completedTasks = await TaskRequest.countDocuments({ 
      userId, 
      status: 'completed' 
    });

    // Compter les factures et revenus
    const totalInvoices = await Invoice.countDocuments({ userId });
    const paidInvoices = await Invoice.countDocuments({ 
      userId, 
      paymentStatus: 'paid' 
    });
    const pendingInvoices = await Invoice.countDocuments({ 
      userId, 
      paymentStatus: 'pending' 
    });

    // Calculer les montants
    const invoiceData = await Invoice.aggregate([
      { $match: { userId: userId } },
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
};

// @desc    Obtenir l'historique complet de l'utilisateur
// @route   GET /api/users/history
// @access  Private
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sortBy = 'date', order = 'desc', limit = 50, page = 1 } = req.query;

    // Recuperer les taches avec pagination
    const skip = (page - 1) * limit;
    
    const tasks = await TaskRequest.find({ userId })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Recuperer les factures associees
    const invoices = await Invoice.find({ userId })
      .populate('requestId', 'title taskType status')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Compter le total
    const totalTasks = await TaskRequest.countDocuments({ userId });
    const totalInvoices = await Invoice.countDocuments({ userId });

    res.json({
      tasks: {
        data: tasks,
        total: totalTasks,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalTasks / limit)
      },
      invoices: {
        data: invoices,
        total: totalInvoices,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalInvoices / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
