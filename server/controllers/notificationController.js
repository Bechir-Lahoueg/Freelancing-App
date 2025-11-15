import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Obtenir les notifications pour l'utilisateur connecté
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/read
// @access  Private (Admin)
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer une notification
// @route   POST /api/notifications (Internal)
// @access  Private
export const createNotification = async (type, message, comment) => {
  try {
    // Récupérer tous les admins et superadmins
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');

    console.log('📍 Found admins:', admins.length);

    // Créer une notification pour chaque admin
    const notifications = admins.map(admin => ({
      admin: admin._id,
      type,
      message,
      comment: {
        _id: comment._id,
        text: comment.text,
        rating: comment.rating,
        userEmail: comment.user.email,
        userName: comment.user.name
      }
    }));

    await Notification.insertMany(notifications);
    console.log('🔔 Notifications created:', notifications.length);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};
